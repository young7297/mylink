"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GoogleIcon,
  ShieldCheck,
  Database,
  Plus,
  Sparkles,
  SlidersHorizontal,
  FolderGit2,
  ExternalLink,
} from "@/components/icons";

interface UnauthenticatedViewProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function UnauthenticatedView({
  onLogin,
  isLoggingIn,
}: UnauthenticatedViewProps) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. 메인 로그인 안내 Hero 카드 */}
      <Card className="w-full p-6 sm:p-8 text-center shadow-toss-2 mb-5 overflow-hidden relative">
        {/* 상단 장식 그라디언트 라인 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3182f6] via-[#60a5fa] to-[#93c5fd]" />

        {/* 상단 엠블럼 아이콘 */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#e8f3ff] text-[#3182f6] flex items-center justify-center shadow-sm">
          <GoogleIcon className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2f4f6] text-[#4e5968] text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3182f6]" />
          <span>안전한 Google 소셜 로그인</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#191f28] tracking-tight mb-2">
          로그인하고 나만의 마이페이지를 시작하세요
        </h2>

        <p className="text-[14.5px] text-[#4e5968] leading-relaxed max-w-[420px] mx-auto mb-6 break-keep">
          마이페이지는 구글 계정으로 로그인한 뒤 사용할 수 있어요.
          로그인 즉시 회원님 전용의 클라우드 저장소가 활성화되어 링크를 안전하게 관리할 수 있어요.
        </p>

        {/* 메인 Google 로그인 CTA 버튼 */}
        <div className="max-w-[340px] mx-auto mb-6">
          <Button
            variant="outline"
            size="lg"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full border-[#d1d6db] hover:border-[#b0b8c1] hover:bg-[#f9fafb] text-[#191f28] shadow-sm flex items-center justify-center gap-3 h-12 text-[15px] font-bold rounded-xl transition-all cursor-pointer"
          >
            <GoogleIcon className="w-5 h-5 shrink-0" />
            <span>{isLoggingIn ? "Google 로그인 진행 중..." : "Google 계정으로 시작하기"}</span>
          </Button>
          <p className="text-[11.5px] text-[#8b95a1] mt-2.5">
            별도의 가입 절차 없이 구글 계정으로 3초 만에 시작해요
          </p>
        </div>

        {/* 2. 로그인 후 사용 가능한 주요 기능 소개 */}
        <div className="text-left pt-5 border-t border-[#e5e8eb]/80">
          <h3 className="text-xs font-bold text-[#8b95a1] uppercase tracking-wider mb-3">
            로그인 시 제공되는 기능
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]/80 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#e8f3ff] text-[#3182f6] shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#191f28]">개인화 저장소</p>
                <p className="text-[11.5px] text-[#6b7684] leading-snug">
                  클라우드 저장소에 나만의 링크가 안전하게 보관돼요
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]/80 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#e6f9f0] text-[#00a854] shrink-0 mt-0.5">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#191f28]">자유로운 링크 관리</p>
                <p className="text-[11.5px] text-[#6b7684] leading-snug">
                  링크 추가, 수정, 삭제를 실시간으로 간편하게 처리해요
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]/80 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#fff4e5] text-[#d9730d] shrink-0 mt-0.5">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#191f28]">카테고리 & 검색</p>
                <p className="text-[11.5px] text-[#6b7684] leading-snug">
                  프로젝트, 저장소, 기술스택, 소셜별로 똑똑하게 분류해요
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]/80 flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#f4ebfb] text-[#8e44ad] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#191f28]">TDS 모던 인터페이스</p>
                <p className="text-[11.5px] text-[#6b7684] leading-snug">
                  토스 디자인 시스템 스타일의 깔끔한 카드 뷰를 제공해요
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. 로그인 후 화면 미리보기 (Teaser Mockup) */}
      <section aria-label="화면 미리보기" className="w-full opacity-80 pointer-events-none select-none">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-[#8b95a1]">
            미리보기: 로그인 후 화면 예시
          </span>
          <Badge variant="grey" size="xs">
            로그인 필요
          </Badge>
        </div>

        <Card className="p-4 shadow-toss-1 divide-y divide-[#e5e8eb]/70 space-y-3 bg-white/70 backdrop-blur-xs">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#e8f3ff] text-[#3182f6] flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div>
                <div className="h-4 w-28 bg-[#e5e8eb] rounded mb-1 animate-pulse" />
                <div className="h-3 w-40 bg-[#f2f4f6] rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-[#e8f3ff] rounded-md" />
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-[#4e5968]">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#191f28]">GitHub 포트폴리오 & 코드 저장소</p>
                <p className="text-xs text-[#8b95a1]">진행 중인 프로젝트와 오픈소스 저장소예요</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8b95a1]" />
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e8f3ff] flex items-center justify-center text-[#3182f6]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#191f28]">Firestore 개인 링크 허브</p>
                <p className="text-xs text-[#8b95a1]">회원님만을 위해 안전하게 보관된 맞춤 링크</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8b95a1]" />
          </div>
        </Card>
      </section>
    </div>
  );
}
