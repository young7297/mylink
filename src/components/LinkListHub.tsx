"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LinkItem, MyLinkData, UserProfile, SocialLinks } from "@/types/link";
import {
  MOCK_MYLINK_DATA,
  CATEGORY_OPTIONS,
} from "@/data/mockLinks";
import ProfileHeader from "@/components/ProfileHeader";
import LinkCard from "@/components/LinkCard";
import AddLinkDialog from "@/components/AddLinkDialog";
import DeleteLinkDialog from "@/components/DeleteLinkDialog";
import { toast } from "sonner";
import UnauthenticatedView from "@/components/UnauthenticatedView";
import {
  Search,
  X,
  Share2,
  Plus,
  RotateCcw,
  Loader2,
  GoogleIcon,
  LogOut,
} from "@/components/icons";
import {
  addLinkToFirestore,
  deleteLinkFromFirestore,
  updateLinkInFirestore,
  getLinksFromFirestore,
  seedSampleLinksToFirestore,
} from "@/lib/linkService";
import { useAuth } from "@/lib/authContext";
import { getEmailPrefix } from "@/lib/utils";

// TDS 기반 UI 컴포넌트
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface LinkListHubProps {
  slug?: string;
}

export default function LinkListHub({ slug = "dayoung" }: LinkListHubProps) {
  const {
    user,
    userProfile,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signOut,
    updateProfile,
  } = useAuth();

  const [data, setData] = useState<MyLinkData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // Sonner 기반 토스트 알림 헬퍼 (중앙 상단 표시 및 고가독성 텍스트)
  const showToast = (
    message: string,
    action?: { label: string; onClick: () => void }
  ) => {
    if (action) {
      toast(message, {
        action: {
          label: action.label,
          onClick: action.onClick,
        },
      });
    } else {
      toast(message);
    }
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

  // Google 소셜 로그인 핸들러
  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const loggedIn = await signInWithGoogle();
      if (loggedIn) {
        const welcomeName = getEmailPrefix(loggedIn.email, "회원");
        showToast(`환영합니다, ${welcomeName}님!`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Google 로그인 실패:", error);
      showToast("로그인 실패: " + (err?.message || "다시 시도해 주세요"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await signOut();
      setData(null);
      showToast("로그아웃되었습니다.");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("로그아웃 실패:", error);
      showToast("로그아웃 실패: " + (err?.message || "다시 시도해 주세요"));
    }
  };

  // 수동 새로고침 핸들러 (Firestore user/{uid}/links에서 최신 링크 다시 조회)
  const handleRefresh = async () => {
    if (!user || isRefreshing || isUpdating) return;

    try {
      setIsRefreshing(true);
      setUpdateMessage(`user/${user.uid}/links에서 최신 링크를 불러오고 있어요...`);
      const firestoreLinks = await getLinksFromFirestore(user.uid);

      setData((prev) => {
        if (!prev) return prev;
        const updatedData = { ...prev, links: firestoreLinks };
        try {
          localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }
        return updatedData;
      });

      showToast("최신 링크 목록을 불러왔어요");
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("새로고침 실패:", error);
      showToast("새로고침 실패: " + (err?.message || "다시 시도해 주세요"));
    } finally {
      setIsRefreshing(false);
      setUpdateMessage("");
    }
  };

  // Firestore 연동 링크 추가 핸들러 (경로: user/{user.uid}/links)
  const handleAddLink = async (
    newLinkData: Omit<LinkItem, "id" | "order" | "createdAt">
  ) => {
    if (!user) {
      showToast("로그인 후 링크를 추가할 수 있어요");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateMessage(`user/${user.uid}/links에 새 링크를 저장하고 있어요...`);

      // 1. Firestore user/{user.uid}/links 컬렉션에 추가
      const savedLink = await addLinkToFirestore(user.uid, newLinkData, 0);

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
          localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }

        return updatedData;
      });

      showToast(`'${savedLink.title}' 링크가 성공적으로 추가되었어요!`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Firestore 저장 실패:", error);
      showToast("Firestore 저장 실패: " + (err?.message || "다시 시도해 주세요"));
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

  // 삭제 확인 모달에서 [삭제하기] 클릭 시 실행 (Firestore user/{user.uid}/links 연동)
  const handleConfirmDelete = async (linkToDelete: LinkItem) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      setUpdateMessage(`user/${user.uid}/links에서 링크를 삭제하고 있어요...`);

      // 1. Firestore user/{user.uid}/links 경로에서 문서 삭제
      await deleteLinkFromFirestore(user.uid, linkToDelete.id);

      // 2. 화면 목록 즉시 갱신
      setData((prev) => {
        if (!prev) return prev;
        const updatedLinks = prev.links.filter((l) => l.id !== linkToDelete.id);
        const updatedData = { ...prev, links: updatedLinks };

        try {
          localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }
        return updatedData;
      });

      showToast(`'${linkToDelete.title}' 링크가 삭제되었습니다.`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Firestore 삭제 실패:", error);
      showToast("삭제 실패: " + (err?.message || "다시 시도해 주세요"));
      throw error;
    } finally {
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 링크 인라인 수정 핸들러 (Firestore user/{user.uid}/links 연동)
  const handleUpdateLink = async (
    id: string,
    updatedFields: Partial<Omit<LinkItem, "id">>
  ) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      setUpdateMessage(`user/${user.uid}/links에 수정 내용을 저장하고 있어요...`);

      const updatedAt = new Date().toISOString();
      const updatedWithTimestamp = {
        ...updatedFields,
        updatedAt,
      };

      // 1. Firestore user/{user.uid}/links 경로의 문서 업데이트 (updatedAt 포함)
      await updateLinkInFirestore(user.uid, id, updatedWithTimestamp);

      // 2. 화면 목록 즉시 갱신
      setData((prev) => {
        if (!prev) return prev;
        const currentLinks = prev.links || [];
        const nextLinks = currentLinks.map((l) =>
          l.id === id ? { ...l, ...updatedWithTimestamp } : l
        );
        const updatedData: MyLinkData = { ...prev, links: nextLinks };

        try {
          localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }
        return updatedData;
      });

      showToast(`'${updatedFields.title || "링크"}' 정보가 성공적으로 수정되었어요!`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Firestore 수정 실패:", error);
      showToast("수정 실패: " + (err?.message || "다시 시도해 주세요"));
      throw error;
    } finally {
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 샘플 링크 일괄 등록 핸들러 (Firestore user/{user.uid}/links에 저장)
  const handleSeedSampleLinks = async () => {
    if (!user) return;

    try {
      setIsSeeding(true);
      setIsUpdating(true);
      setUpdateMessage(`user/${user.uid}/links에 샘플 링크를 등록하고 있어요...`);

      const seeded = await seedSampleLinksToFirestore(user.uid, MOCK_MYLINK_DATA.links);
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, links: seeded };
      });
      showToast(`샘플 링크 ${seeded.length}개가 등록되었어요!`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("샘플 등록 실패:", error);
      showToast("샘플 등록 실패: " + (err?.message || "다시 시도해 주세요"));
    } finally {
      setIsSeeding(false);
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 프로필 정보 수정 핸들러 (Firestore user/{uid} 연동)
  const handleUpdateProfile = async (
    updatedProfileFields: Partial<UserProfile>,
    updatedSocialsFields?: Partial<SocialLinks>
  ) => {
    if (!user || !data) return;

    // 변경된 사항이 전혀 없는 경우 불필요한 Firestore 업데이트 생략
    const isProfileUnchanged =
      (!updatedProfileFields.name || updatedProfileFields.name.trim() === (data.profile.name || "").trim()) &&
      (updatedProfileFields.bio === undefined || updatedProfileFields.bio.trim() === (data.profile.bio || "").trim()) &&
      (updatedProfileFields.jobTitle === undefined || updatedProfileFields.jobTitle.trim() === (data.profile.jobTitle || "").trim()) &&
      (updatedProfileFields.location === undefined || updatedProfileFields.location.trim() === (data.profile.location || "").trim()) &&
      (updatedProfileFields.avatarUrl === undefined || (updatedProfileFields.avatarUrl.trim() || "/profile.png") === (data.profile.avatarUrl || "/profile.png"));

    const isSocialsUnchanged =
      !updatedSocialsFields ||
      ((updatedSocialsFields.github ?? "").trim() === (data.socials.github ?? "").trim() &&
        (updatedSocialsFields.blog ?? "").trim() === (data.socials.blog ?? "").trim() &&
        (updatedSocialsFields.linkedin ?? "").trim() === (data.socials.linkedin ?? "").trim() &&
        (updatedSocialsFields.instagram ?? "").trim() === (data.socials.instagram ?? "").trim());

    if (isProfileUnchanged && isSocialsUnchanged) {
      showToast("변경된 사항이 없어 업데이트하지 않았어요.");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateMessage(`user/${user.uid}에 변경된 프로필을 저장하고 있어요...`);

      const savedProfile = await updateProfile(
        {
          name: updatedProfileFields.name || data?.profile.name || "사용자",
          bio: updatedProfileFields.bio,
          jobTitle: updatedProfileFields.jobTitle,
          location: updatedProfileFields.location,
          avatarUrl: updatedProfileFields.avatarUrl,
        },
        updatedSocialsFields
      );

      // 로컬 data 상태 및 localStorage 즉시 동기화
      setData((prev) => {
        if (!prev) return prev;
        const newSocials = updatedSocialsFields
          ? { ...prev.socials, ...updatedSocialsFields }
          : prev.socials;

        const updatedData: MyLinkData = {
          ...prev,
          profile: savedProfile,
          socials: newSocials,
        };

        try {
          localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }

        return updatedData;
      });

      showToast(`'${savedProfile.name}'님의 프로필이 성공적으로 변경되었어요!`);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("프로필 수정 실패:", error);
      showToast("프로필 수정 실패: " + (err?.message || "다시 시도해 주세요"));
      throw error;
    } finally {
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 데이터 로딩 (로그인한 유저의 Firestore user/{uid}/links에서 링크 목록 조회)
  useEffect(() => {
    let isMounted = true;

    if (!user) {
      queueMicrotask(() => {
        if (isMounted) {
          setData(null);
          setIsLoading(false);
        }
      });
      return;
    }

    async function loadData() {
      setIsLoading(true);

      try {
        const firestoreLinks = await getLinksFromFirestore(user!.uid);

        if (isMounted) {
          const profileToUse: UserProfile = userProfile || {
            uid: user!.uid,
            name: getEmailPrefix(user!.email, "Google 사용자"),
            email: user!.email || "",
            avatarUrl: user!.photoURL || "/profile.png",
            bio: "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
            jobTitle: "마이페이지 멤버",
            location: "대한민국",
            firestorePath: `user/${user!.uid}/links`,
            isGoogleAuth: true,
          };

          setData({
            slug: user!.uid.slice(0, 8),
            profile: profileToUse,
            theme: MOCK_MYLINK_DATA.theme,
            socials: {
              ...MOCK_MYLINK_DATA.socials,
              email: user!.email || MOCK_MYLINK_DATA.socials.email,
            },
            links: firestoreLinks,
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Firestore 유저 링크 로딩 실패:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, userProfile]);

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
    const shareSlug = user ? user.uid.slice(0, 8) : slug;
    const url = typeof window !== "undefined" ? window.location.href : `https://young7297.github.io/mylink/${shareSlug}`;
    const name = data?.profile.name || getEmailPrefix(user?.email, "마이페이지");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} — 마이페이지`,
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

  // 1. 인증 초기화 로딩 상태 (TDS 3-dot 로딩)
  if (isAuthLoading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f2f4f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm font-medium text-[#6b7684]">
            Google 로그인 상태를 확인하고 있어요...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start pb-28 bg-[#f2f4f6] font-sans">
      
      {/* ========================================================= */}
      {/* 1. 상단 내비게이션 바 (헤더에 구글 소셜 로그인 기능 연동)  */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f2f4f6]/90 border-b border-[#e5e8eb]/70 relative">
        <div className="max-w-[520px] mx-auto h-14 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#191f28] font-bold text-lg hover:text-[#3182f6] transition-colors">
            <span className="w-7 h-7 rounded-xl bg-[#3182f6] text-white flex items-center justify-center text-xs font-black shadow-sm">
              M
            </span>
            <span>마이페이지</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* 로그인 안 된 상태: 헤더에 Google 로그인 버튼 제공 */}
            {!user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="gap-2 font-semibold text-xs h-8 px-3 border-[#d1d6db] hover:border-[#b0b8c1] hover:bg-white text-[#191f28] shadow-2xs cursor-pointer"
                title="Google 계정으로 로그인"
              >
                <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{isLoggingIn ? "로그인 중..." : "Google 로그인"}</span>
              </Button>
            ) : (
              /* 로그인 된 상태: 유저 아바타/이름, 새로고침, 링크 추가, 로그아웃 버튼 */
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* 사용자 정보 미니 뱃지 (이메일 앞부분 display name) */}
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-[#e5e8eb] shadow-2xs max-w-[120px] sm:max-w-[160px]">
                  <Avatar size="sm" className="w-5 h-5 shrink-0 border-0">
                    <AvatarImage
                      src={userProfile?.avatarUrl || user.photoURL || "/profile.png"}
                      alt={userProfile?.name || getEmailPrefix(user.email, "User")}
                    />
                    <AvatarFallback className="text-[10px]">
                      {(userProfile?.name || getEmailPrefix(user.email, "U"))[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-[#191f28] font-semibold truncate hidden xs:inline">
                    {userProfile?.name || getEmailPrefix(user.email, "사용자")}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isUpdating}
                  className="gap-1 font-medium text-xs text-[#4e5968] h-8 px-2 sm:px-2.5"
                  title={`user/${user.uid}/links 새로고침`}
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 ${
                      isRefreshing ? "animate-spin text-[#3182f6]" : ""
                    }`}
                  />
                  <span className="hidden md:inline">새로고침</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="gap-1 shadow-sm font-semibold h-8 px-2.5 sm:px-3 text-xs"
                  disabled={isUpdating}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>링크 추가</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-1 text-xs text-[#8b95a1] hover:text-[#f04452] h-8 px-2"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">로그아웃</span>
                </Button>
              </div>
            )}
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
      {/* 2. 메인 콘텐츠 컨테이너 (로그인 여부에 따른 화면 분기)    */}
      {/* ========================================================= */}
      <div className="w-full max-w-[520px] px-4 pt-4 flex flex-col">
        
        {/* Case A: 로그인을 안 한 경우 -> 설명 문구 및 로그인 유도 화면 */}
        {!user ? (
          <>
            <UnauthenticatedView
              onLogin={handleGoogleLogin}
              isLoggingIn={isLoggingIn}
            />

            {/* 하단 고정 CTA (비로그인 상태용) */}
            <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
              <div className="w-full max-w-[520px] mx-auto px-4 pb-5 pt-6 bottom-cta-protection pointer-events-auto">
                <Button
                  variant="primary"
                  size="pill"
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full shadow-toss-2 gap-2.5"
                >
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>{isLoggingIn ? "Google 로그인 중..." : "Google 계정으로 시작하기"}</span>
                </Button>
              </div>
            </div>

            {/* 푸터 안내 */}
            <footer className="mt-8 text-center text-xs text-[#8b95a1] space-y-1">
              <p>© 2026 마이페이지 · Google 소셜 로그인 & Firestore 개인화</p>
              <p className="text-[11px] text-[#b0b8c1]">
                토스 디자인 시스템(TDS) 가이드라인을 준수하여 제작되었어요
              </p>
            </footer>
          </>
        ) : (
          /* Case B: 로그인을 한 경우 -> user/{user.uid}/links 개인화 화면 */
          <>
            {/* 업데이트/갱신 진행 상태 알림 뱃지 */}
            {(isRefreshing || isUpdating) && (
              <div className="w-full flex items-center justify-center mb-3 animate-in fade-in duration-200">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f3ff] text-[#3182f6] text-xs font-semibold shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#3182f6]" />
                  <span>{updateMessage || "목록을 갱신하고 있어요..."}</span>
                </div>
              </div>
            )}

            {/* 로딩 인디케이터 (링크 데이터 조회 중) */}
            {isLoading || !data ? (
              <Card className="w-full p-12 text-center my-6 shadow-toss-1">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-3 h-3 rounded-full bg-[#3182f6] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <p className="text-sm font-semibold text-[#191f28]">
                    개인화 링크를 불러오고 있어요
                  </p>
                  <code className="text-xs text-[#3182f6] font-mono bg-[#e8f3ff] px-2 py-0.5 rounded">
                    user/{user.uid}/links
                  </code>
                </div>
              </Card>
            ) : (
              <>
                {/* 프로필 헤더 (로그인한 유저 정보 및 user/{user.uid}/links 경로 표시) */}
                <ProfileHeader
                  profile={data.profile}
                  socials={data.socials}
                  slug={data.slug}
                  onShowToast={showToast}
                  onUpdateProfile={handleUpdateProfile}
                  isEditable={Boolean(user)}
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
                          : "등록된 링크가 아직 없어요"}
                      </p>
                      <p className="text-sm text-[#6b7684] mb-4">
                        {searchQuery.trim() || selectedCategory !== "all"
                          ? "검색어 또는 카테고리 필터를 초기화해 보세요."
                          : "첫 번째 링크를 직접 추가하거나 샘플 링크 8개를 불러와 보세요."}
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
                  <p>© 2026 마이페이지 · {data.profile.name}</p>
                  <p className="text-[11px] text-[#b0b8c1]">
                    Firestore 경로: user/{user.uid}/links · 토스 디자인 시스템(TDS) 준수
                  </p>
                </footer>

                {/* ========================================================= */}
                {/* 5. 하단 고정 CTA (로그인 상태용: 프로필 공유하기)         */}
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
                      <span>내 마이페이지 공유하기</span>
                    </Button>
                  </div>
                </div>

                {/* 링크 추가 다이얼로그 (Firestore user/{user.uid}/links 연동) */}
                <AddLinkDialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                  onAddLink={handleAddLink}
                  existingLinks={data?.links}
                />

                {/* 링크 삭제 확인 모달 (Firestore user/{user.uid}/links 연동) */}
                <DeleteLinkDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                  link={deleteModalLink}
                  onConfirmDelete={handleConfirmDelete}
                />
              </>
            )}
          </>
        )}

      </div>
    </main>
  );
}
