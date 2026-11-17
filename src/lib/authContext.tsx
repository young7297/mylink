"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserProfile } from "@/types/link";
import {
  getUserProfileFromFirestore,
  syncUserProfileToFirestore,
} from "@/lib/linkService";
import { getEmailPrefix } from "@/lib/utils";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
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
      const firebaseError = error as { code?: string };
      if (
        firebaseError.code === "auth/popup-closed-by-user" ||
        firebaseError.code === "auth/cancelled-popup-request"
      ) {
        console.log("사용자가 Google 로그인 팝업을 닫았습니다.");
        return null;
      }
      console.error("Google 로그인 실패:", error);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        signInWithGoogle,
        signOut,
        refreshProfile,
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
