"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfile, SocialLinks } from "@/types/link";
import {
  getUserProfileFromFirestore,
  updateUserProfileInFirestore,
} from "@/lib/linkService";

export const profileQueryKeys = {
  all: ["profile"] as const,
  detail: (uid?: string) => ["profile", uid] as const,
};

export interface UpdateProfileVariables {
  uid: string;
  profileData: {
    name: string;
    bio?: string;
    jobTitle?: string;
    location?: string;
    avatarUrl?: string;
  };
  socialsData?: Partial<SocialLinks>;
}

/**
 * 유저 프로필 조회 쿼리 훅 (TanStack Query v5)
 */
export function useUserProfile(uid?: string, initialData?: UserProfile | null) {
  return useQuery({
    queryKey: profileQueryKeys.detail(uid),
    queryFn: async () => {
      if (!uid) return null;
      return getUserProfileFromFirestore(uid);
    },
    enabled: Boolean(uid),
    initialData: initialData || undefined,
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });
}

/**
 * 프로필 수정 뮤테이션 훅 (낙관적 업데이트 Optimistic Update 적용)
 */
export function useUpdateProfileMutation(options?: {
  onOptimisticUpdate?: (
    optimisticProfile: UserProfile,
    optimisticSocials?: Partial<SocialLinks>
  ) => void;
  onRollback?: (previousProfile?: UserProfile) => void;
  onSuccess?: (savedProfile: UserProfile) => void;
  onError?: (
    error: unknown,
    variables: UpdateProfileVariables,
    context?: { previousProfile?: UserProfile }
  ) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uid, profileData, socialsData }: UpdateProfileVariables) => {
      return updateUserProfileInFirestore(uid, profileData, socialsData);
    },
    // =========================================================================
    // 1. 낙관적 업데이트 (Optimistic Update)
    //    서버 응답을 기다리지 않고 화면 캐시를 즉시 갱신하여 0ms 반응성 제공
    // =========================================================================
    onMutate: async ({ uid, profileData, socialsData }) => {
      // 1-1. 진행 중인 프로필 쿼리 취소 (경쟁 상태 방지)
      await queryClient.cancelQueries({ queryKey: profileQueryKeys.detail(uid) });

      // 1-2. 롤백을 위해 기존 캐시 데이터 스냅샷 저장
      const previousProfile = queryClient.getQueryData<UserProfile>(
        profileQueryKeys.detail(uid)
      );

      // 1-3. 낙관적 프로필 객체 생성
      const optimisticProfile: UserProfile = {
        ...(previousProfile || {
          uid,
          name: profileData.name,
          email: "",
          bio: profileData.bio || "",
          jobTitle: profileData.jobTitle,
          location: profileData.location,
          avatarUrl: profileData.avatarUrl,
        }),
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      // 1-4. 캐시에 즉시 반영
      queryClient.setQueryData(profileQueryKeys.detail(uid), optimisticProfile);

      // 1-5. 로컬 State/localStorage 즉시 동기화 콜백 호출
      if (options?.onOptimisticUpdate) {
        options.onOptimisticUpdate(optimisticProfile, socialsData);
      }

      // 1-6. 롤백용 context 반환
      return { previousProfile };
    },
    // =========================================================================
    // 2. 오류 발생 시 자동 롤백 (Rollback)
    // =========================================================================
    onError: (error, variables, context) => {
      if (context?.previousProfile) {
        // 캐시를 이전 상태로 복구
        queryClient.setQueryData(
          profileQueryKeys.detail(variables.uid),
          context.previousProfile
        );
        if (options?.onRollback) {
          options.onRollback(context.previousProfile);
        }
      }
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    // =========================================================================
    // 3. 성공 콜백
    // =========================================================================
    onSuccess: (savedProfile) => {
      if (options?.onSuccess) {
        options.onSuccess(savedProfile);
      }
    },
    // =========================================================================
    // 4. 완료 후 쿼리 무효화 (최종 서버 정합성 확보)
    // =========================================================================
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.detail(variables.uid),
      });
    },
  });
}
