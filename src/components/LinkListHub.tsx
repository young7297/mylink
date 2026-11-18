"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LinkItem, MyLinkData, UserProfile, SocialLinks } from "@/types/link";
import {
  MOCK_MYLINK_DATA,
  CATEGORY_OPTIONS,
} from "@/data/mockLinks";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileDropdown from "@/components/ProfileDropdown";
import UserNotFoundView from "@/components/UserNotFoundView";
import LinkCard from "@/components/LinkCard";
import AddLinkDialog from "@/components/AddLinkDialog";
import DeleteLinkDialog from "@/components/DeleteLinkDialog";
import EditProfileDialog from "@/components/EditProfileDialog";
import { toast } from "sonner";
import UnauthenticatedView from "@/components/UnauthenticatedView";
import { useUpdateProfileMutation } from "@/hooks/useProfile";
import {
  Search,
  X,
  Share2,
  Plus,
  RotateCcw,
  Loader2,
  GoogleIcon,
  User,
  ArrowUpRight,
  MousePointerClick,
} from "@/components/icons";
import {
  addLinkToFirestore,
  deleteLinkFromFirestore,
  updateLinkInFirestore,
  getLinksFromFirestore,
  seedSampleLinksToFirestore,
  getUserByDisplayName,
  recordLinkClick,
} from "@/lib/linkService";
import { useAuth } from "@/lib/authContext";
import { getEmailPrefix } from "@/lib/utils";

// TDS 기반 UI 컴포넌트
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LinkListHubProps {
  displayName?: string;
  slug?: string;
}

export default function LinkListHub({
  displayName,
  slug,
}: LinkListHubProps) {
  const params = useParams();
  const routeDisplayName = displayName || (params?.displayName as string) || slug || "";

  const {
    user,
    userProfile,
    isLoading: isAuthLoading,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const [data, setData] = useState<MyLinkData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // 현재 방문자가 이 페이지의 소유자(편집 권한 보유자)인지 여부
  const isOwner = routeDisplayName
    ? Boolean(user && targetUserId && user.uid === targetUserId)
    : Boolean(user);

  const myDisplayName =
    userProfile?.displayName ||
    userProfile?.name ||
    getEmailPrefix(user?.email, "사용자");

  // Sonner 기반 토스트 알림 헬퍼
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

  // TanStack Query 기반 프로필 수정 뮤테이션 (낙관적 업데이트 Optimistic Update 적용)
  const updateProfileMutation = useUpdateProfileMutation({
    onOptimisticUpdate: (optimisticProfile, optimisticSocials) => {
      // 1. 낙관적 업데이트: 서버 응답 전 즉시 화면과 localStorage 갱신 (0ms 지연)
      setData((prev) => {
        if (!prev) return prev;
        const newSocials = optimisticSocials
          ? { ...prev.socials, ...optimisticSocials }
          : prev.socials;

        const updatedData: MyLinkData = {
          ...prev,
          profile: optimisticProfile,
          socials: newSocials,
        };

        if (user) {
          try {
            localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
          } catch (e) {
            console.warn("localStorage save error:", e);
          }
        }

        return updatedData;
      });

      showToast(`'${optimisticProfile.name}'님의 프로필이 즉시 반영되었어요!`);
    },
    onRollback: (previousProfile) => {
      // 2. 오류 발생 시 이전 프로필로 자동 롤백 (Rollback)
      if (!previousProfile) return;
      setData((prev) => {
        if (!prev) return prev;
        const rolledBackData: MyLinkData = {
          ...prev,
          profile: previousProfile,
        };

        if (user) {
          try {
            localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(rolledBackData));
          } catch (e) {
            console.warn("localStorage rollback error:", e);
          }
        }

        return rolledBackData;
      });
      showToast("프로필 업데이트에 실패하여 이전 상태로 복구했어요.");
    },
    onSuccess: (savedProfile) => {
      console.log("Firestore 프로필 저장 완료:", savedProfile.name);
    },
    onError: (error) => {
      const err = error as { message?: string };
      console.error("Firestore 프로필 저장 실패:", error);
      showToast("저장 실패: " + (err?.message || "다시 시도해 주세요"));
    },
  });

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

  // 수동 새로고침 핸들러 (Firestore users/{userId}/links에서 최신 링크 다시 조회)
  const handleRefresh = async () => {
    const uidToFetch = targetUserId || user?.uid;
    if (!uidToFetch || isRefreshing || isUpdating) return;

    try {
      setIsRefreshing(true);
      setUpdateMessage(`users/${uidToFetch}/links에서 최신 링크를 불러오고 있어요...`);
      const firestoreLinks = await getLinksFromFirestore(uidToFetch);

      setData((prev) => {
        if (!prev) return prev;
        const updatedData = { ...prev, links: firestoreLinks };
        if (user && user.uid === uidToFetch) {
          try {
            localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
          } catch (e) {
            console.warn("localStorage save error:", e);
          }
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

  // Firestore 연동 링크 추가 핸들러 (경로: users/{user.uid}/links)
  const handleAddLink = async (
    newLinkData: Omit<LinkItem, "id" | "order" | "createdAt">
  ) => {
    if (!user) {
      showToast("로그인 후 링크를 추가할 수 있어요");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateMessage(`users/${user.uid}/links에 새 링크를 저장하고 있어요...`);

      // 1. Firestore users/{user.uid}/links 컬렉션에 추가
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

  // 삭제 확인 모달에서 [삭제하기] 클릭 시 실행 (Firestore users/{user.uid}/links 연동)
  const handleConfirmDelete = async (linkToDelete: LinkItem) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      setUpdateMessage(`users/${user.uid}/links에서 링크를 삭제하고 있어요...`);

      // 1. Firestore users/{user.uid}/links 경로에서 문서 삭제
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

  // 링크 인라인 수정 핸들러 (Firestore users/{user.uid}/links 연동)
  const handleUpdateLink = async (
    id: string,
    updatedFields: Partial<Omit<LinkItem, "id">>
  ) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      setUpdateMessage(`users/${user.uid}/links에 수정 내용을 저장하고 있어요...`);

      const updatedAt = new Date().toISOString();
      const updatedWithTimestamp = {
        ...updatedFields,
        updatedAt,
      };

      // 1. Firestore users/{user.uid}/links 경로의 문서 업데이트 (updatedAt 포함)
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

  // 샘플 링크 일괄 등록 핸들러 (Firestore users/{user.uid}/links에 저장)
  const handleSeedSampleLinks = async () => {
    if (!user) return;

    try {
      setIsSeeding(true);
      setIsUpdating(true);
      setUpdateMessage(`users/${user.uid}/links에 샘플 링크를 등록하고 있어요...`);

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

  // 프로필 정보 수정 핸들러 (Firestore users/{uid} 연동)
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
      setUpdateMessage(`users/${user.uid}에 변경된 프로필을 저장하고 있어요...`);

      // TanStack Query Mutation 실행 -> onMutate에서 0ms 낙관적 업데이트 즉시 반영
      await updateProfileMutation.mutateAsync({
        uid: user.uid,
        profileData: {
          name: updatedProfileFields.name || data.profile.name || "사용자",
          bio: updatedProfileFields.bio,
          jobTitle: updatedProfileFields.jobTitle,
          location: updatedProfileFields.location,
          avatarUrl: updatedProfileFields.avatarUrl,
        },
        socialsData: updatedSocialsFields,
      });
    } catch {
      // 에러는 updateProfileMutation.onError에서 롤백 및 토스트 처리됨
    } finally {
      setIsUpdating(false);
      setUpdateMessage("");
    }
  };

  // 데이터 로딩 (displayName 동적 조회 또는 로그인한 유저의 Firestore users/{uid}/links 조회)
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // Case 1: routeDisplayName 이 존재하는 경우 (/[displayName] 동적 라우팅 페이지)
      if (routeDisplayName) {
        setIsLoading(true);
        setIsNotFound(false);
        try {
          const targetName = decodeURIComponent(routeDisplayName).trim();
          // 1. displayName으로 userId 검색 (Firestore where 쿼리)
          const result = await getUserByDisplayName(targetName);

          if (!isMounted) return;

          if (!result) {
            // username 없으면 404 페이지로 전환
            setIsNotFound(true);
            setData(null);
            setIsLoading(false);
            return;
          }

          setTargetUserId(result.userId);

          // 2. 링크 조회: users/{userId}/links
          const firestoreLinks = await getLinksFromFirestore(result.userId);
          if (!isMounted) return;

          setData({
            slug: targetName,
            profile: result.profile,
            theme: MOCK_MYLINK_DATA.theme,
            socials: result.socials || {
              ...MOCK_MYLINK_DATA.socials,
              email: result.profile.email || "",
            },
            links: firestoreLinks,
          });
          setIsNotFound(false);
        } catch (err) {
          console.error("Firestore 유저 및 링크 조회 실패:", err);
          if (isMounted) setIsNotFound(true);
        } finally {
          if (isMounted) setIsLoading(false);
        }
        return;
      }

      // Case 2: routeDisplayName 이 없는 경우 (메인 / 페이지)
      if (!user) {
        queueMicrotask(() => {
          if (isMounted) {
            setData(null);
            setIsNotFound(false);
            setIsLoading(false);
          }
        });
        return;
      }

      setIsLoading(true);
      try {
        setTargetUserId(user.uid);
        // 로그인한 본인의 users/{user.uid}/links 조회
        const firestoreLinks = await getLinksFromFirestore(user.uid);

        if (isMounted) {
          const profileToUse: UserProfile = userProfile || {
            uid: user.uid,
            name: getEmailPrefix(user.email, "Google 사용자"),
            displayName: getEmailPrefix(user.email, "Google 사용자"),
            email: user.email || "",
            avatarUrl: user.photoURL || "/profile.png",
            bio: "나만의 맞춤 링크를 한곳에서 관리하고 공유해요.",
            jobTitle: "마이페이지 멤버",
            location: "대한민국",
            firestorePath: `users/${user.uid}/links`,
            isGoogleAuth: true,
          };

          setData({
            slug: userProfile?.displayName || userProfile?.name || user.uid.slice(0, 8),
            profile: profileToUse,
            theme: MOCK_MYLINK_DATA.theme,
            socials: {
              ...MOCK_MYLINK_DATA.socials,
              email: user.email || MOCK_MYLINK_DATA.socials.email,
            },
            links: firestoreLinks,
          });
          setIsNotFound(false);
        }
      } catch (err) {
        console.error("Firestore 유저 링크 로딩 실패:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [routeDisplayName, user, userProfile]);

  // 필터링된 링크 목록
  const filteredLinks = useMemo(() => {
    if (!data || !data.links) return [];

    return data.links.filter((link) => {
      // 1. 활성/비활성 필터: 방문자(!isOwner)는 항상 활성화된 링크만 노출
      if (!isOwner && link.active === false) {
        return false;
      }
      // 소유자인 경우 showInactive 토글 스위치 설정 따름
      if (isOwner && !showInactive && link.active === false) {
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
        return titleMatch || descMatch || urlMatch;
      }

      return true;
    });
  }, [data, showInactive, selectedCategory, searchQuery, isOwner]);

  // 비활성화 링크 개수 계산 (소유자용)
  const inactiveCount = useMemo(() => {
    if (!data || !data.links) return 0;
    return data.links.filter((l) => l.active === false).length;
  }, [data]);

  // 전체 클릭 수 합계 계산
  const totalClicks = useMemo(() => {
    if (!data || !data.links) return 0;
    return data.links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  }, [data]);

  // 링크 클릭 핸들러 (클릭 카운트 저장 및 새 창 열기)
  const handleLinkOpen = (link: LinkItem) => {
    if (link.active === false) {
      showToast("이 링크는 현재 비활성화되어 있어요");
      return;
    }

    const uid = targetUserId || user?.uid;

    // 1. UI 즉시 낙관적 업데이트 (+1)
    setData((prev) => {
      if (!prev) return prev;
      const updatedLinks = prev.links.map((l) =>
        l.id === link.id ? { ...l, clickCount: (l.clickCount || 0) + 1 } : l
      );
      const updatedData = { ...prev, links: updatedLinks };
      if (user && user.uid === uid) {
        try {
          localStorage.setItem(`mylink_data_${user.uid}`, JSON.stringify(updatedData));
        } catch (e) {
          console.warn("localStorage save error:", e);
        }
      }
      return updatedData;
    });

    // 2. Firestore 클릭 카운트 영구 저장 (Atomic Increment)
    if (uid) {
      recordLinkClick(uid, link.id).catch((err) => {
        console.warn("Firestore 클릭 카운트 저장 오류:", err);
      });
    }

    // 3. 브라우저에서 대상 URL 새 탭으로 열기
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  // 하단 공유 버튼 클릭 핸들러
  const handleShareBottomCTA = async () => {
    if (!data) return;
    const name = data.profile.name || "마이페이지";
    const currentSlug = routeDisplayName || data.slug || "mylink";
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : `https://young7297.github.io/mylink/${encodeURIComponent(currentSlug)}`;

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

  // 2. 일치하는 username이 없는 경우: 404 페이지 렌더링
  if (isNotFound) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-start pb-28 bg-[#f2f4f6] font-sans">
        {/* 상단 내비게이션 바 */}
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#f2f4f6]/90 border-b border-[#e5e8eb]/70 relative">
          <div className="max-w-[520px] mx-auto h-14 px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#191f28] font-bold text-lg hover:text-[#3182f6] transition-colors">
              <span className="w-7 h-7 rounded-xl bg-[#3182f6] text-white flex items-center justify-center text-xs font-black shadow-sm">
                M
              </span>
              <span>마이페이지</span>
            </Link>

            <div className="flex items-center gap-2">
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href={`/${encodeURIComponent(myDisplayName)}`}
                    className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full bg-[#3182f6] hover:bg-[#256cd8] active:bg-[#1b56b3] text-white shadow-sm font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer group"
                    title={`${myDisplayName}님의 개인 페이지로 이동`}
                  >
                    <User className="w-3.5 h-3.5 text-white shrink-0" />
                    <span className="hidden sm:inline">내 페이지 바로가기</span>
                    <span className="sm:hidden">내 페이지</span>
                    <ArrowUpRight className="w-3 h-3 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </Link>

                  <ProfileDropdown
                    user={user}
                    userProfile={userProfile}
                    onOpenEditProfile={() => setIsEditProfileOpen(true)}
                    onLogout={handleLogout}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 404 알림 뷰 */}
        <UserNotFoundView displayName={routeDisplayName} />
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start pb-28 bg-[#f2f4f6] font-sans">
      
      {/* ========================================================= */}
      {/* 1. 상단 내비게이션 바 (개인별 페이지 이동 및 프로필 드롭다운) */}
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
              /* 로그인 된 상태: 헤더 개인별 페이지 이동 버튼, 프로필 드롭다운, 링크 추가 */
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* 1) 헤더 내 페이지 바로가기 버튼 (Primary 디자인) */}
                <Link
                  href={`/${encodeURIComponent(myDisplayName)}`}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full bg-[#3182f6] hover:bg-[#256cd8] active:bg-[#1b56b3] text-white shadow-sm font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer group"
                  title={`${myDisplayName}님의 개인 페이지로 이동`}
                >
                  <User className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="hidden sm:inline">내 페이지 바로가기</span>
                  <span className="sm:hidden">내 페이지</span>
                  <ArrowUpRight className="w-3 h-3 text-white/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </Link>

                {/* 2) 프로필 드롭다운 (개인별 페이지 이동 및 프로필 설정 메뉴) */}
                <ProfileDropdown
                  user={user}
                  userProfile={userProfile}
                  onOpenEditProfile={() => setIsEditProfileOpen(true)}
                  onRefresh={isOwner ? handleRefresh : undefined}
                  onAddLink={isOwner ? () => setIsAddDialogOpen(true) : undefined}
                  onLogout={handleLogout}
                  isRefreshing={isRefreshing}
                  isUpdating={isUpdating}
                />

                {/* 소유자 전용: 새로고침 & 링크 추가 바로가기 */}
                {isOwner && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing || isUpdating}
                      className="gap-1 font-medium text-xs text-[#4e5968] h-8 px-2 sm:px-2.5 hidden md:flex cursor-pointer"
                      title={`users/${targetUserId || user.uid}/links 새로고침`}
                    >
                      <RotateCcw
                        className={`w-3.5 h-3.5 ${
                          isRefreshing ? "animate-spin text-[#3182f6]" : ""
                        }`}
                      />
                      <span>새로고침</span>
                    </Button>

                    <Button
                      variant="weak"
                      size="sm"
                      onClick={() => setIsAddDialogOpen(true)}
                      className="gap-1 shadow-2xs font-semibold h-8 px-2.5 sm:px-3 text-xs hidden sm:flex cursor-pointer border border-[#3182f6]/15"
                      disabled={isUpdating}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>링크 추가</span>
                    </Button>
                  </>
                )}
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
      {/* 2. 메인 콘텐츠 컨테이너 (비로그인 메인 vs 공개/개인화 화면) */}
      {/* ========================================================= */}
      <div className="w-full max-w-[520px] px-4 pt-4 flex flex-col">
        
        {/* Case A: 메인 홈(/) 접속 시 비로그인 상태 -> 로그인 유도 화면 */}
        {!routeDisplayName && !user ? (
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
                  className="w-full shadow-toss-2 gap-2.5 cursor-pointer"
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
          /* Case B: 개인별 공개 페이지(/[displayName]) 또는 로그인 사용자 화면 */
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
                    {routeDisplayName
                      ? `‘${routeDisplayName}’ 님의 링크를 불러오고 있어요`
                      : "개인화 링크를 불러오고 있어요"}
                  </p>
                  <code className="text-xs text-[#3182f6] font-mono bg-[#e8f3ff] px-2 py-0.5 rounded">
                    users/{targetUserId || user?.uid || "..."}/links
                  </code>
                </div>
              </Card>
            ) : (
              <>
                {/* 프로필 헤더 (사용자 정보 및 공유 기능) */}
                <ProfileHeader
                  profile={data.profile}
                  socials={data.socials}
                  slug={routeDisplayName || data.slug}
                  onShowToast={showToast}
                  onUpdateProfile={isOwner ? handleUpdateProfile : undefined}
                  isEditable={isOwner}
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="tabular-num">
                        총 <strong className="text-[#191f28] font-semibold">{filteredLinks.length}</strong>개의 링크
                      </span>
                      <span className="text-[#d1d6db]">·</span>
                      <span className="inline-flex items-center gap-1 text-[#4e5968]" title={`총 조회수 ${totalClicks.toLocaleString()}`}>
                        <MousePointerClick className="w-3.5 h-3.5 text-[#3182f6]" />
                        <strong className="text-[#3182f6] font-semibold tabular-nums">{totalClicks.toLocaleString()}</strong>
                      </span>
                    </div>

                    {/* 소유자 전용: 비활성 포함 토글 및 빠른 추가 버튼 */}
                    {isOwner && (
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
                          className="gap-1 text-[12px] h-7 px-2.5 font-semibold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>추가</span>
                        </Button>
                      </div>
                    )}
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
                          onDeleteLink={isOwner ? handleRequestDelete : undefined}
                          onUpdateLink={isOwner ? handleUpdateLink : undefined}
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
                          : isOwner
                          ? "첫 번째 링크를 직접 추가하거나 샘플 링크를 불러와 보세요."
                          : "해당 사용자가 등록한 활성화 링크가 없어요."}
                      </p>

                      {isOwner && (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsAddDialogOpen(true)}
                            className="gap-1.5 cursor-pointer"
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
                              className="cursor-pointer"
                            >
                              필터 초기화하기
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleSeedSampleLinks}
                              disabled={isSeeding}
                              className="gap-1.5 cursor-pointer"
                            >
                              <span>{isSeeding ? "샘플 등록 중..." : "샘플 링크 불러오기"}</span>
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  )}
                </section>

                {/* 푸터 안내 */}
                <footer className="mt-8 text-center text-xs text-[#8b95a1] space-y-1">
                  <p>© 2026 마이페이지 · {data.profile.name}</p>
                  <p className="text-[11px] text-[#b0b8c1]">
                    Firestore 경로: users/{targetUserId || user?.uid || "..."}/links · 토스 디자인 시스템(TDS) 준수
                  </p>
                </footer>

                {/* ========================================================= */}
                {/* 5. 하단 고정 CTA (프로필 공유하기)                        */}
                {/* ========================================================= */}
                <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
                  <div className="w-full max-w-[520px] mx-auto px-4 pb-5 pt-6 bottom-cta-protection pointer-events-auto">
                    <Button
                      variant="primary"
                      size="pill"
                      onClick={handleShareBottomCTA}
                      className="w-full shadow-toss-2 cursor-pointer"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>
                        {isOwner
                          ? "내 마이페이지 공유하기"
                          : `${data.profile.name}님의 페이지 공유하기`}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* 소유자 전용: 링크 추가 다이얼로그 (Firestore users/{user.uid}/links 연동) */}
                {isOwner && (
                  <AddLinkDialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                    onAddLink={handleAddLink}
                    existingLinks={data?.links}
                  />
                )}

                {/* 소유자 전용: 링크 삭제 확인 모달 (Firestore users/{user.uid}/links 연동) */}
                {isOwner && (
                  <DeleteLinkDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    link={deleteModalLink}
                    onConfirmDelete={handleConfirmDelete}
                  />
                )}

                {/* 프로필 드롭다운 등에서 트리거되는 프로필 수정 다이얼로그 */}
                {user && (
                  <EditProfileDialog
                    open={isEditProfileOpen}
                    onOpenChange={setIsEditProfileOpen}
                    profile={userProfile || data.profile}
                    socials={data.socials}
                    currentUid={user.uid}
                    onSaveProfile={handleUpdateProfile}
                  />
                )}
              </>
            )}
          </>
        )}

      </div>
    </main>
  );
}
