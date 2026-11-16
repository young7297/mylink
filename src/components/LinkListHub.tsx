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
import AddLinkDialog from "@/components/AddLinkDialog";
import DeleteLinkDialog from "@/components/DeleteLinkDialog";
import Toast from "@/components/Toast";
import { Search, X, Share2, Plus, RotateCcw, Loader2 } from "@/components/icons";
import {
  addLinkToFirestore,
  deleteLinkFromFirestore,
  updateLinkInFirestore,
  getLinksFromFirestore,
  seedSampleLinksToFirestore,
} from "@/lib/linkService";

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
  const [toastAction, setToastAction] = useState<
    { label: string; onClick: () => void } | undefined
  >(undefined);

  const showToast = (
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    setToastMessage(message);
    setToastAction(action);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, action ? 3500 : 2800);
  };

  // 링크 추가 다이얼로그 상태
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  // 링크 삭제 확인 모달 상태
  const [deleteModalLink, setDeleteModalLink] = useState<LinkItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  // 샘플 데이터 시딩 로딩 상태
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // 업데이트 및 갱신 상태 관리
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");

  // 수동 새로고침 핸들러 (Firestore에서 최신 링크 다시 조회)
  const handleRefresh = async () => {
    if (isRefreshing || isUpdating) return;

    try {
      setIsRefreshing(true);
      setUpdateMessage("최신 링크를 불러오고 있어요...");
      const firestoreLinks = await getLinksFromFirestore();

      setData((prev) => {
        if (!prev) return prev;
        const updatedData = { ...prev, links: firestoreLinks };
        try {
          localStorage.setItem("mylink_data", JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }
        return updatedData;
      });

      showToast("최신 링크 목록을 불러왔어요");
    } catch (error: any) {
      console.error("새로고침 실패:", error);
      showToast("새로고침 실패: " + (error?.message || "다시 시도해 주세요"));
    } finally {
      setIsRefreshing(false);
      setUpdateMessage("");
    }
  };

  // Firestore 연동 링크 추가 핸들러 (경로: users/anonymous/links)
  const handleAddLink = async (
    newLinkData: Omit<LinkItem, "id" | "order" | "createdAt">
  ) => {
    try {
      setIsUpdating(true);
      setUpdateMessage("새 링크를 Firestore에 저장하고 있어요...");

      // 1. Firestore users/anonymous/links 컬렉션에 추가
      const savedLink = await addLinkToFirestore(newLinkData, 0);

      // 2. 화면 목록 즉시 갱신 (createdAt 기준 최신순 정렬)
      setData((prev) => {
        if (!prev) return prev;
        const currentLinks = prev.links || [];
        const nextLinks = [savedLink, ...currentLinks.filter((l) => l.id !== savedLink.id)];
        nextLinks.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        const updatedData: MyLinkData = { ...prev, links: nextLinks };
        try {
          localStorage.setItem("mylink_data", JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }

        return updatedData;
      });

      showToast(`'${savedLink.title}' 링크가 성공적으로 추가되었어요!`);
    } catch (error: any) {
      console.error("Firestore 저장 실패:", error);
      showToast("Firestore 저장 실패: " + (error?.message || "다시 시도해 주세요"));
      throw error;
    } finally {
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 링크 삭제 확인 모달 열기 요청 핸들러
  const handleRequestDelete = (link: LinkItem) => {
    setDeleteModalLink(link);
    setIsDeleteDialogOpen(true);
  };

  // 삭제 확인 모달에서 [삭제하기] 클릭 시 실행 (Firestore 연동)
  const handleConfirmDelete = async (linkToDelete: LinkItem) => {
    try {
      setIsUpdating(true);
      setUpdateMessage("Firestore에서 링크를 삭제하고 있어요...");

      // 1. Firestore users/anonymous/links 경로에서 문서 삭제
      await deleteLinkFromFirestore(linkToDelete.id);

      // 2. 화면 목록 즉시 갱신
      setData((prev) => {
        if (!prev) return prev;
        const updatedLinks = prev.links.filter((l) => l.id !== linkToDelete.id);
        const updatedData = { ...prev, links: updatedLinks };

        try {
          localStorage.setItem("mylink_data", JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }
        return updatedData;
      });

      showToast(`'${linkToDelete.title}' 링크가 삭제되었습니다.`);
    } catch (error: any) {
      console.error("Firestore 삭제 실패:", error);
      showToast("삭제 실패: " + (error?.message || "다시 시도해 주세요"));
      throw error;
    } finally {
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 링크 인라인 수정 핸들러 (Firestore users/anonymous/links 연동)
  const handleUpdateLink = async (
    id: string,
    updatedFields: Partial<Omit<LinkItem, "id">>
  ) => {
    try {
      setIsUpdating(true);
      setUpdateMessage("Firestore에 수정 내용을 저장하고 있어요...");

      const updatedAt = new Date().toISOString();
      const updatedWithTimestamp = {
        ...updatedFields,
        updatedAt,
      };

      // 1. Firestore users/anonymous/links 경로의 문서 업데이트 (updatedAt 포함)
      await updateLinkInFirestore(id, updatedWithTimestamp);

      // 2. 화면 목록 즉시 갱신
      setData((prev) => {
        if (!prev) return prev;
        const currentLinks = prev.links || [];
        const nextLinks = currentLinks.map((l) =>
          l.id === id ? { ...l, ...updatedWithTimestamp } : l
        );
        const updatedData: MyLinkData = { ...prev, links: nextLinks };

        try {
          localStorage.setItem("mylink_data", JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }
        return updatedData;
      });

      showToast(`'${updatedFields.title || "링크"}' 정보가 성공적으로 수정되었어요!`);
    } catch (error: any) {
      console.error("Firestore 수정 실패:", error);
      showToast("수정 실패: " + (error?.message || "다시 시도해 주세요"));
      throw error;
    } finally {
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 샘플 링크 일괄 등록 핸들러 (Firestore가 비어있을 때 사용)
  const handleSeedSampleLinks = async () => {
    try {
      setIsSeeding(true);
      setIsUpdating(true);
      setUpdateMessage("샘플 링크 8개를 Firestore에 등록하고 있어요...");

      const seeded = await seedSampleLinksToFirestore(MOCK_MYLINK_DATA.links);
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, links: seeded };
      });
      showToast("샘플 링크 8개가 Firestore에 등록되었어요!");
    } catch (error: any) {
      console.error("샘플 등록 실패:", error);
      showToast("샘플 등록 실패: " + (error?.message || "다시 시도해 주세요"));
    } finally {
      setIsSeeding(false);
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 데이터 로딩 (페이지 로드 시 Firestore users/anonymous/links에서 최신순 링크 조회)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setIsNotFound(false);

      try {
        const targetSlug = slug === "links" ? "dayoung" : slug.toLowerCase();

        // 일치하는 프로필 슬러그 체크
        if (targetSlug !== "dayoung") {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }

        const baseData = MOCK_MYLINK_DATA;

        // 페이지 로드 시 Firestore(users/anonymous/links)에서 최신순 링크 조회
        const firestoreLinks = await getLinksFromFirestore();

        if (isMounted) {
          setData({
            slug: targetSlug,
            profile: baseData.profile,
            theme: baseData.theme,
            socials: baseData.socials,
            links: firestoreLinks,
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Firestore 초기 데이터 로딩 실패:", err);
        if (isMounted) {
          setData({
            ...MOCK_MYLINK_DATA,
            links: [],
          });
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
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
            Firestore에서 링크를 불러오고 있어요...
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
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f2f4f6]/90 border-b border-[#e5e8eb]/70 relative">
        <div className="max-w-[520px] mx-auto h-14 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#191f28] font-bold text-lg hover:text-[#3182f6] transition-colors">
            <span className="w-7 h-7 rounded-xl bg-[#3182f6] text-white flex items-center justify-center text-xs font-black shadow-sm">
              M
            </span>
            <span>마이링크</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isUpdating}
              className="gap-1 font-medium text-xs text-[#4e5968] h-8 px-2.5"
              title="Firestore에서 새로고침"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${
                  isRefreshing ? "animate-spin text-[#3182f6]" : ""
                }`}
              />
              <span className="hidden sm:inline">새로고침</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-1 shadow-sm font-semibold h-8"
              disabled={isUpdating}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>링크 추가</span>
            </Button>
            <span className="text-xs text-[#8b95a1] font-medium bg-white px-2.5 py-1 rounded-full border border-[#e5e8eb] hidden sm:inline">
              윤다영의 링크
            </span>
          </div>
        </div>

        {/* 상단 프로그레스 바 (업데이트 및 갱신 중 로딩 인디케이터) */}
        {(isRefreshing || isUpdating) && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e8f3ff] overflow-hidden">
            <div className="h-full bg-[#3182f6] animate-progress-loading w-full origin-left" />
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. 메인 콘텐츠 컨테이너 (모바일 셸 레이아웃)             */}
      {/* ========================================================= */}
      <div className="w-full max-w-[520px] px-4 pt-4 flex flex-col">
        
        {/* 업데이트/갱신 진행 상태 알림 뱃지 */}
        {(isRefreshing || isUpdating) && (
          <div className="w-full flex items-center justify-center mb-3 animate-in fade-in duration-200">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f3ff] text-[#3182f6] text-xs font-semibold shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#3182f6]" />
              <span>{updateMessage || "목록을 갱신하고 있어요..."}</span>
            </div>
          </div>
        )}

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

            <div className="flex items-center gap-2">
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

              <Button
                variant="weak"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                className="gap-1 text-[12px] h-7 px-2.5 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>추가</span>
              </Button>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* 4. 링크 리스트 카드 (토스 목록 뷰)                      */}
        {/* ======================================================= */}
        <section
          aria-label="링크 목록"
          className={`w-full transition-opacity duration-200 ${
            isRefreshing ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          {filteredLinks.length > 0 ? (
            <Card className="p-1 sm:p-2 divide-y divide-[#e5e8eb]/70 shadow-toss-1 overflow-hidden">
              {filteredLinks.map((link, idx) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  index={idx}
                  existingLinks={data?.links}
                  onOpenLink={handleLinkOpen}
                  onDeleteLink={handleRequestDelete}
                  onUpdateLink={handleUpdateLink}
                />
              ))}
            </Card>
          ) : (
            /* 빈 결과 화면 */
            <Card className="w-full p-8 text-center my-2 shadow-toss-1">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#f2f4f6] text-[#8b95a1] rounded-full flex items-center justify-center text-xl">
                {searchQuery.trim() || selectedCategory !== "all" ? "🔍" : "🔗"}
              </div>
              <p className="text-base font-bold text-[#191f28] mb-1">
                {searchQuery.trim() || selectedCategory !== "all"
                  ? "검색된 링크가 없어요"
                  : "등록된 링크가 없어요"}
              </p>
              <p className="text-sm text-[#6b7684] mb-4">
                {searchQuery.trim() || selectedCategory !== "all"
                  ? "검색어 또는 카테고리 필터를 초기화해 보세요."
                  : "첫 번째 링크를 등록하거나 샘플 링크를 불러와 보세요."}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 링크 추가하기</span>
                </Button>
                {searchQuery.trim() || selectedCategory !== "all" ? (
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
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSeedSampleLinks}
                    disabled={isSeeding}
                    className="gap-1.5"
                  >
                    <span>{isSeeding ? "샘플 등록 중..." : "샘플 링크 불러오기"}</span>
                  </Button>
                )}
              </div>
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

      {/* 링크 추가 다이얼로그 (Firestore users/anonymous/links 연동) */}
      <AddLinkDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddLink={handleAddLink}
        existingLinks={data?.links}
      />

      {/* 링크 삭제 확인 모달 (Firestore users/anonymous/links 연동) */}
      <DeleteLinkDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        link={deleteModalLink}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* TDS 스타일 토스트 알림 */}
      <Toast
        isVisible={isToastVisible}
        message={toastMessage}
        action={toastAction}
        onClose={() => setIsToastVisible(false)}
      />
    </main>
  );
}
