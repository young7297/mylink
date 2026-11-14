"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { LinkItem, MyLinkData } from "@/types/link";
import {
  MOCK_MYLINK_DATA,
  MOCK_DESIGNER_DATA,
  CATEGORY_OPTIONS,
} from "@/data/mockLinks";
import ProfileHeader from "@/components/ProfileHeader";
import LinkCard from "@/components/LinkCard";
import Toast from "@/components/Toast";
import { Search, X } from "@/components/icons";

// shadcn/ui 기반 재사용 하드웨어 컴포넌트 Import
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LinkListHubProps {
  slug?: string;
}

export default function LinkListHub({ slug = "dayoung" }: LinkListHubProps) {
  const [data, setData] = useState<MyLinkData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // Toast 상태
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2800);
  };

  // 데이터 로딩 (localStorage -> Mock Data fallback)
  useEffect(() => {
    setIsLoading(true);
    setIsNotFound(false);

    try {
      // 1. 슬러그 정규화 (links는 dayoung으로 처리)
      const targetSlug = slug === "links" ? "dayoung" : slug.toLowerCase();

      // 2. localStorage 우선 확인
      const storedJson = typeof window !== "undefined" ? localStorage.getItem("mylink_data") : null;
      let loadedData: MyLinkData | null = null;

      if (storedJson) {
        try {
          const parsed = JSON.parse(storedJson) as MyLinkData;
          if (parsed && parsed.slug && parsed.slug.toLowerCase() === targetSlug) {
            loadedData = parsed;
          }
        } catch {
          // parse failed, fallback to mock
        }
      }

      // 3. Mock Data 매핑
      if (!loadedData) {
        if (targetSlug === "dayoung") {
          loadedData = MOCK_MYLINK_DATA;
        } else if (targetSlug === "jisoo-design") {
          loadedData = MOCK_DESIGNER_DATA;
        } else {
          // 일치하는 데이터 없음 -> 404 콘솔 오류
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }
      }

      setData(loadedData);
    } catch {
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  // 필터링된 링크 목록
  const filteredLinks = useMemo(() => {
    if (!data || !data.links) return [];

    return data.links.filter((link) => {
      // 1. 활성/비활성 필터 (기본은 활성 링크만 표시, showInactive 켜면 비활성도 포함)
      if (!showInactive && link.active === false) {
        return false;
      }

      // 2. 카테고리 필터
      if (selectedCategory !== "all") {
        if (link.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = link.title.toLowerCase().includes(q);
        const descMatch = (link.description || "").toLowerCase().includes(q);
        const urlMatch = link.url.toLowerCase().includes(q);
        const catMatch = (link.category || "").toLowerCase().includes(q);

        if (!titleMatch && !descMatch && !urlMatch && !catMatch) {
          return false;
        }
      }

      return true;
    });
  }, [data, selectedCategory, searchQuery, showInactive]);

  // 비활성화된 항목 총 개수 카운트
  const inactiveCount = useMemo(() => {
    if (!data || !data.links) return 0;
    return data.links.filter((l) => l.active === false).length;
  }, [data]);

  const activeCount = useMemo(() => {
    if (!data || !data.links) return 0;
    return data.links.filter((l) => l.active !== false).length;
  }, [data]);

  const handleLinkOpen = (link: LinkItem) => {
    showToast(`링크 열기: ${link.title}`);
    setTimeout(() => {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }, 200);
  };

  // 404 콘솔 오류 화면 (PRD 5.4 명세)
  if (isNotFound) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans select-none">
        <Card variant="chamfered" className="w-full max-w-[540px] p-4 shadow-2xl text-[#21242e]">
          
          {/* 에러 헤더 바 */}
          <div className="carbon-halftone p-2 flex items-center justify-between border-b border-[#3d4f97] text-white mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e60012] animate-ping" />
              <span className="text-xs font-black tracking-wider text-[#e60012]">
                카트리지 읽기 오류
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#ecab37]">
              ERROR #404
            </span>
          </div>

          {/* 에러 본체 웰 */}
          <Card variant="inset-deep" className="p-4 text-center">
            <div className="text-4xl mb-2">💾⚠️</div>
            <h2 className="text-base font-extrabold text-[#21242e] mb-1">
              슬롯 데이터를 찾을 수 없습니다
            </h2>
            <p className="text-xs text-[#21242e]/80 mb-3">
              요청하신 슬러그 <code className="bg-black/10 px-1 py-0.5 rounded font-mono font-bold text-[#e60012]">/{slug}</code> 에 해당하는 프로필 카트리지가 장착되지 않았습니다.
            </p>
            <div className="dotted-divider my-3" />
            <p className="text-[10px] text-[#60619c] font-mono mb-4">
              지원되는 슬러그 목록: /dayoung, /jisoo-design, /links
            </p>

            <div className="flex items-center justify-center gap-2">
              <Link href="/dayoung">
                <Button variant="default" size="default">
                  /dayoung 프로필 열기 ▶
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" size="default">
                  인트로 화면으로 이동
                </Button>
              </Link>
            </div>
          </Card>

        </Card>
      </main>
    );
  }

  // 로딩 화면
  if (isLoading || !data) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans select-none">
        <Card variant="default" className="p-4 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#f68d1f] animate-spin border-2 border-white border-t-transparent" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            프로필 및 링크 데이터 로딩 중...
          </span>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start py-4 px-2 sm:px-4 font-sans select-none">
      
      {/* ========================================================= */}
      {/* 1. 상단 미니 퀵 네비게이션                                */}
      {/* ========================================================= */}
      <header className="w-full max-w-[680px] flex items-center justify-between gap-2 mb-2 px-1">
        <Link href="/">
          <Button variant="secondary" size="xs" className="gap-1.5">
            <span>◀</span>
            <span>메인 콘솔</span>
          </Button>
        </Link>

        {/* 페르소나 전환 바로가기 칩 (테스트 및 둘러보기 편의) */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-white/80 uppercase hidden sm:inline mr-1">
            프로필 선택:
          </span>
          <Link href="/dayoung">
            <Button
              variant={data.slug === "dayoung" ? "default" : "secondary"}
              size="xs"
            >
              다영 (개발자)
            </Button>
          </Link>
          <Link href="/jisoo-design">
            <Button
              variant={data.slug === "jisoo-design" ? "amber" : "secondary"}
              size="xs"
            >
              지수 (디자이너)
            </Button>
          </Link>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. 메인 하드웨어 콘솔 섀시: shadcn/ui Card (chamfered)    */}
      {/* ========================================================= */}
      <Card
        variant="chamfered"
        className="w-full max-w-[680px] shadow-2xl relative p-3 sm:p-4"
      >
        
        {/* 프로필 헤더 컴포넌트 */}
        <ProfileHeader
          profile={data.profile}
          socials={data.socials}
          slug={data.slug}
          onShowToast={showToast}
        />

        {/* ======================================================= */}
        {/* 3. 하드웨어 컨트롤 덱: shadcn/ui Card (periwinkle)       */}
        {/* ======================================================= */}
        <Card variant="periwinkle" className="w-full p-2.5 mb-3">
          
          {/* 상단: 검색 인셋 웰 + 락커 토글 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-2">
            
            {/* 검색 인풋 필드: shadcn/ui Input 적용 */}
            <div className="flex-1 relative flex items-center">
              <span className="absolute left-2.5 text-[#3d4f97] pointer-events-none z-10">
                <Search className="w-3.5 h-3.5" />
              </span>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="링크 제목, 설명, 주소 검색..."
                className="pl-8 pr-7"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-gray-500 hover:text-black cursor-pointer z-10"
                  title="검색어 지우기"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 비활성 항목 보기 토글: shadcn/ui Switch 락커 스위치 적용 */}
            {inactiveCount > 0 && (
              <div className="flex items-center gap-2 bg-[#21242e] text-white px-2.5 py-1 bevel-button rounded-[2px] justify-between">
                <Switch
                  checked={showInactive}
                  onCheckedChange={(nextState) => {
                    setShowInactive(nextState);
                    showToast(
                      nextState
                        ? "비활성화된 링크를 포함하여 전체를 표시합니다."
                        : "활성화된 링크만 표시합니다."
                    );
                  }}
                  label={`비활성 포함 (${inactiveCount})`}
                  className="text-white"
                />
              </div>
            )}

          </div>

          {/* 하단: 카테고리 셀렉터 스위치 바: shadcn/ui Tabs 적용 */}
          <Tabs
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <TabsList>
              {CATEGORY_OPTIONS.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* 상태 서머리 라인 */}
          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-[#21242e]/80 mt-2 pt-1 border-t border-[#3d4f97]/30">
            <span className="flex items-center gap-1.5">
              <span>상태:</span>
              <Badge variant="platinum" size="xs">
                {filteredLinks.length}개 표시 중
              </Badge>
            </span>
            <span className="flex items-center gap-1">
              <span>활성:</span>
              <Badge variant="signal" size="xs">
                {activeCount}
              </Badge>
              <span>/</span>
              <Badge variant="carbon" size="xs">
                전체 {data.links?.length || 0}개
              </Badge>
            </span>
          </div>

        </Card>

        {/* ======================================================= */}
        {/* 4. 링크 카트리지 목록                                  */}
        {/* ======================================================= */}
        <section aria-label="링크 목록" className="w-full flex flex-col gap-2">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((link, idx) => (
              <LinkCard
                key={link.id}
                link={link}
                index={idx}
                onOpenLink={handleLinkOpen}
              />
            ))
          ) : (
            /* 빈 결과 하드웨어 인디케이터 */
            <Card variant="inset-deep" className="w-full p-6 text-center my-2">
              <div className="text-3xl mb-1">🔍</div>
              <p className="text-xs font-extrabold text-[#21242e] uppercase mb-1">
                검색된 링크가 없습니다
              </p>
              <p className="text-[10px] text-[#60619c]">
                현재 선택된 카테고리나 검색어와 일치하는 링크가 없습니다.
              </p>
              <Button
                variant="default"
                size="xs"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setShowInactive(true);
                }}
                className="mt-3"
              >
                필터 초기화
              </Button>
            </Card>
          )}
        </section>

        {/* ======================================================= */}
        {/* 5. 푸터: 닌텐도 2001 하드웨어 감성 카본 슬래브          */}
        {/* ======================================================= */}
        <footer className="carbon-halftone border border-[#3d4f97] p-3 text-white flex flex-col sm:flex-row items-center justify-between gap-3 select-none mt-4 rounded-[2px]">
          <div className="flex items-center gap-2">
            <Image
              src="/esrb-badge.svg"
              alt="ESRB 인증"
              width={100}
              height={30}
              className="h-6 w-auto"
            />
            <div className="text-left font-mono text-[9px] text-[#9fbee7]">
              <div>모델 번호: AGB-001</div>
              <div className="text-[#ecab37]">2001 콘솔 에디션</div>
            </div>
          </div>

          <div className="text-center sm:text-right micro-label text-[#9fbee7] space-y-0.5">
            <p>
              © 2001–2026 마이링크 프로젝트 · {data.profile.name}
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-2 text-[9px] text-[#ecab37] font-bold">
              <Link href="/" className="hover:underline">
                홈으로
              </Link>
              <span>•</span>
              <button
                type="button"
                onClick={() => showToast("시스템 하드웨어: 정상 작동 중")}
                className="hover:underline cursor-pointer"
              >
                시스템 진단
              </button>
              <span>•</span>
              <a
                href={data.socials?.email ? `mailto:${data.socials.email}` : "mailto:ydo9902@gmail.com"}
                className="hover:underline"
              >
                문의하기
              </a>
            </div>
          </div>
        </footer>

      </Card>

      {/* Retro Console Toast */}
      <Toast
        isVisible={isToastVisible}
        message={toastMessage}
        onClose={() => setIsToastVisible(false)}
      />
    </main>
  );
}
