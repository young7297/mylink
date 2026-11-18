"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User as FirebaseUser } from "firebase/auth";
import { UserProfile } from "@/types/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  ExternalLink,
  Pencil,
  RotateCcw,
  Plus,
  LogOut,
  ChevronDown,
} from "@/components/icons";
import { getEmailPrefix } from "@/lib/utils";

interface ProfileDropdownProps {
  user: FirebaseUser;
  userProfile: UserProfile | null;
  onOpenEditProfile?: () => void;
  onRefresh?: () => void;
  onAddLink?: () => void;
  onLogout: () => void;
  isRefreshing?: boolean;
  isUpdating?: boolean;
}

export default function ProfileDropdown({
  user,
  userProfile,
  onOpenEditProfile,
  onRefresh,
  onAddLink,
  onLogout,
  isRefreshing = false,
  isUpdating = false,
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName =
    userProfile?.displayName ||
    userProfile?.name ||
    getEmailPrefix(user.email, "사용자");

  const avatarUrl =
    userProfile?.avatarUrl || user.photoURL || "/profile.png";

  const encodedPath = `/${encodeURIComponent(displayName)}`;

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape 키 누를 때 드롭다운 닫기
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* 1. 드롭다운 트리거 버튼 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 bg-white pl-1.5 pr-2 py-1 rounded-full border border-[#e5e8eb] shadow-2xs hover:border-[#b0b8c1] hover:bg-[#f9fafb] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#3182f6] max-w-[140px] sm:max-w-[180px]"
        title={`${displayName} 프로필 메뉴 열기`}
      >
        <Avatar size="sm" className="w-6 h-6 shrink-0 border-0">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-[10px] font-bold">
            {displayName[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <span className="text-xs text-[#191f28] font-semibold truncate">
          {displayName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8b95a1] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#3182f6]" : ""
          }`}
        />
      </button>

      {/* 2. 드롭다운 메뉴 팝업 (TDS 스타일 카드) */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white border border-[#e5e8eb] shadow-toss-3 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right focus:outline-none"
        >
          {/* 상단 사용자 요약 카드 */}
          <div className="p-3 bg-[#f9fafb] rounded-xl border border-[#e5e8eb]/70 mb-2">
            <div className="flex items-center gap-3">
              <Avatar size="md" className="w-10 h-10 shrink-0 border border-white shadow-2xs">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-xs font-bold">
                  {displayName[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-[#191f28] truncate">
                    {displayName}
                  </h4>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#e8f3ff] text-[#3182f6] shrink-0">
                    Google
                  </span>
                </div>
                {user.email && (
                  <p className="text-[11px] text-[#6b7684] truncate mt-0.5">
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            {/* 개인별 링크 URL 칩 */}
            <div className="mt-2.5 pt-2 border-t border-[#e5e8eb] flex items-center justify-between">
              <span className="text-[11px] text-[#8b95a1] font-mono truncate">
                /{displayName}
              </span>
              <Link
                href={encodedPath}
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-[#3182f6] hover:text-[#1b64da] hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>페이지 이동</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 메뉴 아이템 1: 개인별 페이지 이동 (강조된 최우선 액션) */}
          <div className="space-y-0.5">
            <Link
              href={encodedPath}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#e8f3ff]/60 active:bg-[#e8f3ff] text-[#191f28] transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#e8f3ff] text-[#3182f6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#191f28] group-hover:text-[#3182f6] transition-colors">
                    개인별 페이지 이동
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#3182f6] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-[#8b95a1] truncate">
                  /{displayName} 내 링크 모음 허브로 이동
                </p>
              </div>
            </Link>

            {/* 메뉴 아이템 2: 프로필 수정 */}
            {onOpenEditProfile && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onOpenEditProfile();
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f2f4f6] active:bg-[#e5e8eb] text-[#191f28] transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#f2f4f6] text-[#4e5968] flex items-center justify-center shrink-0 group-hover:bg-[#e5e8eb] transition-colors">
                  <Pencil className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-xs font-semibold text-[#191f28] block">
                    프로필 수정
                  </span>
                  <p className="text-[11px] text-[#8b95a1] truncate">
                    이름, 소개글, 아바타 변경
                  </p>
                </div>
              </button>
            )}

            {/* 메뉴 아이템 3: 최신 링크 새로고침 */}
            {onRefresh && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onRefresh();
                }}
                disabled={isRefreshing || isUpdating}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f2f4f6] active:bg-[#e5e8eb] text-[#191f28] transition-colors cursor-pointer group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-xl bg-[#f2f4f6] text-[#4e5968] flex items-center justify-center shrink-0 group-hover:bg-[#e5e8eb] transition-colors">
                  <RotateCcw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#3182f6]" : ""}`}
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-xs font-semibold text-[#191f28] block">
                    링크 새로고침
                  </span>
                  <p className="text-[11px] text-[#8b95a1] truncate">
                    최신 링크 데이터 다시 불러오기
                  </p>
                </div>
              </button>
            )}

            {/* 메뉴 아이템 4: 새 링크 추가 */}
            {onAddLink && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  onAddLink();
                }}
                disabled={isUpdating}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f2f4f6] active:bg-[#e5e8eb] text-[#191f28] transition-colors cursor-pointer group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-xl bg-[#f2f4f6] text-[#4e5968] flex items-center justify-center shrink-0 group-hover:bg-[#e5e8eb] transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-xs font-semibold text-[#191f28] block">
                    새 링크 추가
                  </span>
                  <p className="text-[11px] text-[#8b95a1] truncate">
                    새로운 사이트 또는 SNS 링크 등록
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* 하단 구분선 및 로그아웃 */}
          <div className="mt-1 pt-1 border-t border-[#f2f4f6]">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#feecee] active:bg-[#fdd8db] text-[#f04452] transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#feecee] text-[#f04452] flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <span className="text-xs font-semibold block text-[#f04452]">
                  로그아웃
                </span>
                <p className="text-[11px] text-[#f04452]/70 truncate">
                  계정 연결 해제
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
