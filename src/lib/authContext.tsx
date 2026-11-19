"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserProfile, SocialLinks } from "@/types/link";
import {
  getUserProfileFromFirestore,
  syncUserProfileToFirestore,
  updateUserProfileInFirestore,
} from "@/lib/linkService";
import { getEmailPrefix } from "@/lib/utils";

/**
 * Firebase Auth 에러 코드를 사람이 이해하기 쉬운 명확한 한국어 및 해결 방법으로 변환
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "알 수 없는 오류가 발생했습니다.";
  const err = error as { code?: string; message?: string };
  const currentHost = typeof window !== "undefined" ? window.location.hostname : "";

  switch (err.code) {
    case "auth/unauthorized-domain":
      return `[도메인 미승인] 현재 접속 도메인('${currentHost}')이 Firebase에 등록되지 않았어요. Firebase 콘솔 > Authentication > Settings > '승인된 도메인'에 ${currentHost}을(를) 추가해 주세요.`;
    case "auth/operation-not-allowed":
      return "[로그인 제공업체 미활성화] Firebase 콘솔 > Authentication > Sign-in method에서 'Google' 로그인을 사용 설정해 주세요.";
    case "auth/popup-blocked":
      return "브라우저에서 팝업이 차단되었어요. 주소창의 팝업 차단을 해제하고 다시 시도해 주세요.";
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔어요.";
    case "auth/cancelled-popup-request":
      return "이전 로그인 요청이 취소되었어요.";
    case "auth/network-request-failed":
      return "네트워크 오류가 발생했어요. 인터넷 연결 및 광고 차단 프로그램(AdBlock 등) 설정을 확인해 주세요.";
    case "auth/invalid-api-key":
      return "Firebase API 키가 유효하지 않아요. Firebase 프로젝트 설정을 확인해 주세요.";
    case "auth/configuration-not-found":
      return "Firebase 인증 구성이 누락되었어요. OAuth 동의 화면 및 Google 제공업체 설정을 확인해 주세요.";
    default:
      return err.message || "Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    profileData: {
      name: string;
      bio?: string;
      jobTitle?: string;
      location?: string;
      avatarUrl?: string;
    },
    socialsData?: Partial<SocialLinks>
  ) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Firestore user/{uid} 프로필 새로고침
  const refreshProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      const profile = await getUserProfileFromFirestore(user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        const synced = await syncUserProfileToFirestore(user);
        setUserProfile(synced);
      }
    } catch (e) {
      console.warn("프로필 새로고침 실패:", e);
    }
  };

  useEffect(() => {
    // 1. 모바일 및 리다이렉트 로그인 결과 처리
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const redirectUser = result.user;
          setUser(redirectUser);
          try {
            const profile = await syncUserProfileToFirestore({
              uid: redirectUser.uid,
              displayName: redirectUser.displayName,
              email: redirectUser.email,
              photoURL: redirectUser.photoURL,
            });
            setUserProfile(profile);
          } catch (e) {
            console.warn("리다이렉트 프로필 동기화 오류:", e);
          }
        }
      })
      .catch((error) => {
        console.error("리다이렉트 로그인 처리 오류:", error);
      });

    // 2. 인증 상태 변화 감지 리스너
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Firestore user/{uid} 경로와 프로필 동기화
          const profile = await syncUserProfileToFirestore({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          });
          setUserProfile(profile);
        } catch (e) {
          console.warn("사용자 프로필 동기화 오류:", e);
          setUserProfile({
            uid: currentUser.uid,
            name: getEmailPrefix(currentUser.email, currentUser.displayName || "Google 사용자"),
            email: currentUser.email || "",
            avatarUrl: currentUser.photoURL || "/profile.png",
            bio: "나만의 링크를 한곳에서 관리하고 공유해요.",
            firestorePath: `user/${currentUser.uid}/links`,
            isGoogleAuth: true,
          });
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // 1차 시도: 팝업 로그인
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      setUser(loggedInUser);

      // Firestore user/{uid}에 프로필 저장 및 동기화
      const profile = await syncUserProfileToFirestore({
        uid: loggedInUser.uid,
        displayName: loggedInUser.displayName,
        email: loggedInUser.email,
        photoURL: loggedInUser.photoURL,
      });
      setUserProfile(profile);

      return loggedInUser;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };

      if (
        firebaseError.code === "auth/popup-closed-by-user" ||
        firebaseError.code === "auth/cancelled-popup-request"
      ) {
        console.log("사용자가 Google 로그인 팝업을 닫았습니다.");
        return null;
      }

      // 모바일 환경이나 브라우저 팝업 차단 설정인 경우 리다이렉트 방식으로 2차 시도
      if (firebaseError.code === "auth/popup-blocked") {
        console.warn("팝업 차단 감지됨: 리다이렉트 로그인으로 전환합니다.");
        await signInWithRedirect(auth, provider);
        return null;
      }

      console.error("Google 로그인 실패 상세:", firebaseError.code, firebaseError.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  };

  const updateProfile = async (
    profileData: {
      name: string;
      bio?: string;
      jobTitle?: string;
      location?: string;
      avatarUrl?: string;
    },
    socialsData?: Partial<SocialLinks>
  ): Promise<UserProfile> => {
    if (!user) throw new Error("로그인이 필요합니다.");
    const updated = await updateUserProfileInFirestore(user.uid, profileData, socialsData);
    setUserProfile(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signInWithGoogle,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
