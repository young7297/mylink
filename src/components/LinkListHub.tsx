"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LinkItem, MyLinkData } from "@/types/link";
import {
  MOCK_MYLINK_DATA,
  CATEGORY_OPTIONS,
} from "@/data/mockLinks";
import ProfileHeader from "@/components/ProfileHeader";
import LinkCard from "@/components/LinkCard";
import Toast from "@/components/Toast";
import { Search, X, Share2 } from "@/components/icons";

// TDS 기반 UI 컴포넌트
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        } else {
          // 일치하는 데이터 없음 -> 404
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

  const handleLinkOpen = (link: LinkItem) => {
    showToast(`${link.title} 링크로 이동해요`);
    setTimeout(() => {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }, 200);
  };

  const handleShareBottomCTA = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://young7297.github.io/mylink/${slug}`;
    const name = data?.profile.name || "윤다영";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} — 마이링크`,
          text: `${name}님의 링크 모음이에요.`,
          url,
        });
        showToast("페이지 링크를 공유했어요");
      } catch {
        // cancelled
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast("링크 주소를 클립보드에 복사했어요");
    }
  };

  // 404 오류 화면 (토스 스타일)
  if (isNotFound) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f2f4f6]">
        <Card className="w-full max-w-[440px] p-8 text-center shadow-toss-2">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#feecee] text-[#f04452] rounded-full flex items-center justify-center text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-[#191f28] mb-2">
            요청하신 프로필을 찾을 수 없어요
          </h2>
          <p className="text-sm text-[#6b7684] mb-6 leading-relaxed">
            <code className="text-[#3182f6] font-semibold bg-[#e8f3ff] px-1.5 py-0.5 rounded">/{slug}</code> 주소와 일치하는 프로필이 없어요.
          </p>

          <div className="flex flex-col gap-2">
            <Link href="/dayoung" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                윤다영 프로필 보러가기
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="secondary" size="lg" className="w-full">
                홈으로 이동
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  // 로딩 화면 (토스 3-dot 느낌)
  if (isLoading || !data) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f2f4f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm font-medium text-[#6b7684]">
            잠시만 기다려 주세요...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start pb-28 bg-[#f2f4f6] font-sans">
      
      {/* ========================================================= */}
      {/* 1. 상단 내비게이션 바 (TopAppBar: 56px)                   */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f2f4f6]/90 border-b border-[#e5e8eb]/70">
        <div className="max-w-[520px] mx-auto h-14 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#191f28] font-bold text-lg hover:text-[#3182f6] transition-colors">
            <span className="w-7 h-7 rounded-xl bg-[#3182f6] text-white flex items-center justify-center text-xs font-black shadow-sm">
              M
            </span>
            <span>마이링크</span>
          </Link>

          <span className="text-xs text-[#8b95a1] font-medium bg-white px-2.5 py-1 rounded-full border border-[#e5e8eb]">
            윤다영의 링크
          </span>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. 메인 콘텐츠 컨테이너 (모바일 셸 레이아웃)             */}
      {/* ========================================================= */}
      <div className="w-full max-w-[520px] px-4 pt-4 flex flex-col">
        
        {/* 프로필 헤더 */}
        <ProfileHeader
          profile={data.profile}
          socials={data.socials}
          slug={data.slug}
          onShowToast={showToast}
        />

        {/* ======================================================= */}
        {/* 3. 검색 및 필터 컨트롤 바                              */}
        {/* ======================================================= */}
        <section aria-label="링크 검색 및 필터" className="w-full mb-3 space-y-3">
          
          {/* 검색창 (TDS 48px Input) */}
          <div className="relative w-full flex items-center">
            <span className="absolute left-4 text-[#8b95a1] pointer-events-none z-10">
              <Search className="w-4 h-4" />
            </span>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="원하는 링크를 검색해 보세요"
              className="pl-11 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 text-[#8b95a1] hover:text-[#191f28] cursor-pointer p-1"
                title="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 카테고리 칩 목록 (34px Full Pill) */}
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

          {/* 상태 및 필터 서머리 라인 */}
          <div className="flex items-center justify-between px-1 text-xs text-[#6b7684]">
            <span className="tabular-num">
              총 <strong className="text-[#191f28] font-semibold">{filteredLinks.length}</strong>개의 링크가 있어요
            </span>

            {/* 비활성 항목 포함 토글 */}
            {inactiveCount > 0 && (
              <Switch
                checked={showInactive}
                onCheckedChange={(nextState) => {
                  setShowInactive(nextState);
                  showToast(
                    nextState
                      ? "비활성화된 링크를 포함하여 표시해요"
                      : "활성화된 링크만 표시해요"
                  );
                }}
                label={`비활성 포함 (${inactiveCount})`}
              />
            )}
          </div>
        </section>

        {/* ======================================================= */}
        {/* 4. 링크 리스트 카드 (토스 목록 뷰)                      */}
        {/* ======================================================= */}
        <section aria-label="링크 목록" className="w-full">
          {filteredLinks.length > 0 ? (
            <Card className="p-1 sm:p-2 divide-y divide-[#e5e8eb]/70 shadow-toss-1 overflow-hidden">
              {filteredLinks.map((link, idx) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  index={idx}
                  onOpenLink={handleLinkOpen}
                />
              ))}
            </Card>
          ) : (
            /* 빈 결과 화면 */
            <Card className="w-full p-8 text-center my-2 shadow-toss-1">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#f2f4f6] text-[#8b95a1] rounded-full flex items-center justify-center text-xl">
                🔍
              </div>
              <p className="text-base font-bold text-[#191f28] mb-1">
                검색된 링크가 없어요
              </p>
              <p className="text-sm text-[#6b7684] mb-4">
                다른 검색어를 입력하거나 필터를 초기화해 보세요.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setShowInactive(true);
                }}
              >
                필터 초기화하기
              </Button>
            </Card>
          )}
        </section>

        {/* 푸터 안내 */}
        <footer className="mt-8 text-center text-xs text-[#8b95a1] space-y-1">
          <p>© 2026 마이링크 · {data.profile.name}</p>
          <p className="text-[11px] text-[#b0b8c1]">
            토스 디자인 시스템(TDS) 가이드라인을 준수하여 제작되었어요
          </p>
        </footer>

      </div>

      {/* ========================================================= */}
      {/* 5. 하단 고정 CTA (TDS BottomCTA: 56px + 보호 그라디언트)   */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="w-full max-w-[520px] mx-auto px-4 pb-5 pt-6 bottom-cta-protection pointer-events-auto">
          <Button
            variant="primary"
            size="pill"
            onClick={handleShareBottomCTA}
            className="w-full shadow-toss-2"
          >
            <Share2 className="w-5 h-5" />
            <span>이 프로필 공유하기</span>
          </Button>
        </div>
      </div>

      {/* TDS 스타일 토스트 알림 */}
      <Toast
        isVisible={isToastVisible}
        message={toastMessage}
        onClose={() => setIsToastVisible(false)}
      />
    </main>
  );
}
