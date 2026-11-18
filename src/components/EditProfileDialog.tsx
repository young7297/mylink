"use client";

import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import { UserProfile, SocialLinks } from "@/types/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  GitHubIcon,
  VelogIcon,
  LinkedInIcon,
  InstagramIcon,
  Check,
} from "@/components/icons";
import { checkDisplayNameDuplicate } from "@/lib/linkService";

// 대표 아바타 프리셋 4종 (프로젝트 public 자산)
const AVATAR_PRESETS = [
  { id: "profile", label: "기본 프로필", src: "/profile.png" },
  { id: "mario", label: "콘솔 마리오", src: "/mario-welcome.svg" },
  { id: "neo", label: "네오 사이버", src: "/avatar-neo.svg" },
  { id: "classic", label: "클래식 엠블럼", src: "/avatar.svg" },
];

export interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  socials?: SocialLinks;
  currentUid?: string;
  onSaveProfile: (
    updatedProfile: Partial<UserProfile>,
    updatedSocials?: Partial<SocialLinks>
  ) => Promise<void>;
}

type DuplicateStatus =
  | "idle"
  | "checking"
  | "available"
  | "duplicate"
  | "same_as_current"
  | "error";

export default function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  socials,
  currentUid,
  onSaveProfile,
}: EditProfileDialogProps) {
  // 폼 상태
  const [name, setName] = useState(profile.name || "");
  const [jobTitle, setJobTitle] = useState(profile.jobTitle || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [location, setLocation] = useState(profile.location || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "/profile.png");

  // 소셜 링크 상태
  const [github, setGithub] = useState(socials?.github || "");
  const [blog, setBlog] = useState(socials?.blog || "");
  const [linkedin, setLinkedin] = useState(socials?.linkedin || "");
  const [instagram, setInstagram] = useState(socials?.instagram || "");
  const [showSocials, setShowSocials] = useState(false);

  // display name 중복 확인 상태
  const [duplicateStatus, setDuplicateStatus] = useState<DuplicateStatus>("same_as_current");
  const [statusMessage, setStatusMessage] = useState<string>("현재 사용 중인 이름이에요.");
  const [isNameChecked, setIsNameChecked] = useState<boolean>(true);

  // 저장 중 상태
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 디바운스 타이머 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 접근성 id
  const nameId = useId();
  const jobTitleId = useId();
  const bioId = useId();
  const locationId = useId();
  const avatarId = useId();

  // 모달이 열릴 때 프로필 데이터로 폼 상태 초기화
  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        const initialName = profile.name || "";
        setName(initialName);
        setJobTitle(profile.jobTitle || "");
        setBio(profile.bio || "");
        setLocation(profile.location || "");
        setAvatarUrl(profile.avatarUrl || "/profile.png");

        setGithub(socials?.github || "");
        setBlog(socials?.blog || "");
        setLinkedin(socials?.linkedin || "");
        setInstagram(socials?.instagram || "");

        setDuplicateStatus("same_as_current");
        setStatusMessage("현재 사용 중인 이름이에요.");
        setIsNameChecked(true);
        setIsSubmitting(false);
        setSaveError(null);
      });
    }
  }, [open, profile, socials]);

  // 변경 사항 존재 여부 검사 (변경된 사항이 없으면 불필요한 Firestore 업데이트 방지)
  const hasChanges = useMemo(() => {
    const isNameDiff = name.trim() !== (profile.name || "").trim();
    const isJobTitleDiff = jobTitle.trim() !== (profile.jobTitle || "").trim();
    const isBioDiff = bio.trim() !== (profile.bio || "").trim();
    const isLocationDiff = location.trim() !== (profile.location || "").trim();
    const isAvatarDiff =
      (avatarUrl.trim() || "/profile.png") !== (profile.avatarUrl || "/profile.png");

    const isGithubDiff = github.trim() !== (socials?.github || "").trim();
    const isBlogDiff = blog.trim() !== (socials?.blog || "").trim();
    const isLinkedinDiff = linkedin.trim() !== (socials?.linkedin || "").trim();
    const isInstagramDiff = instagram.trim() !== (socials?.instagram || "").trim();

    return (
      isNameDiff ||
      isJobTitleDiff ||
      isBioDiff ||
      isLocationDiff ||
      isAvatarDiff ||
      isGithubDiff ||
      isBlogDiff ||
      isLinkedinDiff ||
      isInstagramDiff
    );
  }, [
    name,
    jobTitle,
    bio,
    location,
    avatarUrl,
    github,
    blog,
    linkedin,
    instagram,
    profile,
    socials,
  ]);

  // 중복 확인 로직 실행 함수
  const executeDuplicateCheck = async (candidateName: string) => {
    const trimmed = candidateName.trim();

    if (!trimmed) {
      setDuplicateStatus("error");
      setStatusMessage("이름을 1자 이상 입력해 주세요.");
      setIsNameChecked(false);
      return;
    }

    if (trimmed.length < 2) {
      setDuplicateStatus("error");
      setStatusMessage("이름은 2자 이상 입력해 주세요.");
      setIsNameChecked(false);
      return;
    }

    if (trimmed.length > 20) {
      setDuplicateStatus("error");
      setStatusMessage("이름은 20자 이내로 입력해 주세요.");
      setIsNameChecked(false);
      return;
    }

    // 기존 이름과 동일한 경우
    if (trimmed === (profile.name || "").trim()) {
      setDuplicateStatus("same_as_current");
      setStatusMessage("현재 사용 중인 이름이에요.");
      setIsNameChecked(true);
      return;
    }

    setDuplicateStatus("checking");
    setStatusMessage("중복 여부를 확인하고 있어요...");

    try {
      const result = await checkDisplayNameDuplicate(trimmed, currentUid);
      if (result.isDuplicate) {
        setDuplicateStatus("duplicate");
        setStatusMessage(result.message);
        setIsNameChecked(false);
      } else {
        setDuplicateStatus("available");
        setStatusMessage(result.message);
        setIsNameChecked(true);
      }
    } catch {
      setDuplicateStatus("error");
      setStatusMessage("중복 확인에 실패했습니다. 다시 시도해 주세요.");
      setIsNameChecked(false);
    }
  };

  // 이름 입력 변경 핸들러 (500ms 디바운스 자동 확인 포함)
  const handleNameChange = (val: string) => {
    setName(val);
    const trimmed = val.trim();

    // 기존 이름과 같으면 즉시 사용 가능
    if (trimmed === (profile.name || "").trim()) {
      setDuplicateStatus("same_as_current");
      setStatusMessage("현재 사용 중인 이름이에요.");
      setIsNameChecked(true);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      return;
    }

    // 이름이 변경되었으므로 확인 필요 상태로 전환
    setDuplicateStatus("idle");
    setStatusMessage("중복 확인 버튼을 누르거나 입력을 완료해 주세요.");
    setIsNameChecked(false);

    // 자동 디바운스 확인
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (trimmed.length >= 2 && trimmed.length <= 20) {
      debounceTimerRef.current = setTimeout(() => {
        executeDuplicateCheck(trimmed);
      }, 600);
    }
  };

  // 수동 [중복 확인] 버튼 클릭 핸들러
  const handleManualCheck = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    executeDuplicateCheck(name);
  };

  // 폼 제출 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // 변경된 사항이 전혀 없는 경우 불필요한 Firestore 요청 없이 다이얼로그 닫기
    if (!hasChanges) {
      onOpenChange(false);
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setSaveError("이름(display name)을 입력해 주세요.");
      return;
    }

    if (trimmedName.length < 2 || trimmedName.length > 20) {
      setSaveError("이름은 2자 이상 20자 이하로 입력해 주세요.");
      return;
    }

    // 기존 이름과 달라졌는데 아직 중복 확인을 통과하지 못한 경우
    if (trimmedName !== (profile.name || "").trim() && !isNameChecked) {
      setSaveError("이름 중복 확인을 완료해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedProfilePayload: Partial<UserProfile> = {
        name: trimmedName,
        jobTitle: jobTitle.trim(),
        bio: bio.trim(),
        location: location.trim(),
        avatarUrl: avatarUrl.trim() || "/profile.png",
      };

      const updatedSocialsPayload: Partial<SocialLinks> = {
        github: github.trim() || undefined,
        blog: blog.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        instagram: instagram.trim() || undefined,
      };

      await onSaveProfile(updatedProfilePayload, updatedSocialsPayload);
      onOpenChange(false);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      console.error("프로필 저장 실패:", err);
      setSaveError(errorObj?.message || "프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-[#e8f3ff] text-[#3182f6] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <DialogTitle className="text-xl font-bold text-[#191f28]">
              프로필 수정
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#6b7684]">
            마이페이지에 표시될 이름, 소개 및 프로필 이미지를 설정해요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* ======================================================= */}
          {/* 1. 프로필 아바타 선택 영역                              */}
          {/* ======================================================= */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e5e8eb]">
            <label htmlFor={avatarId} className="text-xs font-semibold text-[#333d4b] flex items-center justify-between">
              <span>프로필 이미지</span>
              <span className="text-[11px] text-[#8b95a1] font-normal">프리셋을 선택해 보세요</span>
            </label>

            <div className="flex items-center gap-3">
              {/* 현재 선택된 아바타 미리보기 */}
              <Avatar size="lg" className="border-2 border-white shadow-toss-1 shrink-0">
                <AvatarImage src={avatarUrl} alt="프로필 미리보기" />
                <AvatarFallback>
                  <User className="w-6 h-6 text-[#8b95a1]" />
                </AvatarFallback>
              </Avatar>

              {/* 프리셋 선택 칩 */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = avatarUrl === preset.src;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.src)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#3182f6] text-white border-[#3182f6] font-semibold shadow-xs"
                          : "bg-white text-[#4e5968] border-[#e5e8eb] hover:border-[#b0b8c1]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ======================================================= */}
          {/* 2. 이름 (Display Name) 입력 + 중복 확인                */}
          {/* ======================================================= */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={nameId} className="text-xs font-semibold text-[#191f28] flex items-center gap-1">
                <span>이름 (Display Name)</span>
                <span className="text-[#f04452]">*</span>
              </label>
              <span className="text-[11px] text-[#8b95a1]">
                {name.length}/20자
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id={nameId}
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="예: 윤다영, Alex Yoon"
                  maxLength={20}
                  className={`pr-8 ${
                    duplicateStatus === "duplicate" || duplicateStatus === "error"
                      ? "border-[#f04452] focus-visible:ring-[#f04452]"
                      : duplicateStatus === "available" || duplicateStatus === "same_as_current"
                      ? "border-[#00b569] focus-visible:ring-[#00b569]"
                      : ""
                  }`}
                  required
                />
                {/* 실시간 상태 인디케이터 아이콘 */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {duplicateStatus === "checking" && (
                    <Loader2 className="w-4 h-4 animate-spin text-[#3182f6]" />
                  )}
                  {(duplicateStatus === "available" || duplicateStatus === "same_as_current") && (
                    <CheckCircle2 className="w-4 h-4 text-[#00b569]" />
                  )}
                  {(duplicateStatus === "duplicate" || duplicateStatus === "error") && (
                    <AlertCircle className="w-4 h-4 text-[#f04452]" />
                  )}
                </div>
              </div>

              {/* 중복 확인 버튼 */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleManualCheck}
                disabled={duplicateStatus === "checking" || !name.trim()}
                className="shrink-0 font-semibold h-12 px-3 text-xs"
              >
                {duplicateStatus === "checking" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "중복 확인"
                )}
              </Button>
            </div>

            {/* 중복 확인 상태 피드백 안내 메시지 */}
            <div className="text-[12px] flex items-center gap-1.5 pt-0.5">
              {duplicateStatus === "checking" && (
                <span className="text-[#3182f6] flex items-center gap-1 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  {statusMessage}
                </span>
              )}
              {(duplicateStatus === "available" || duplicateStatus === "same_as_current") && (
                <span className="text-[#00b569] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  {statusMessage}
                </span>
              )}
              {duplicateStatus === "duplicate" && (
                <span className="text-[#f04452] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {statusMessage}
                </span>
              )}
              {duplicateStatus === "error" && (
                <span className="text-[#f04452] flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {statusMessage}
                </span>
              )}
              {duplicateStatus === "idle" && (
                <span className="text-[#8b95a1]">
                  {statusMessage}
                </span>
              )}
            </div>
          </div>

          {/* ======================================================= */}
          {/* 3. 직무/역할 (jobTitle) & 위치 (location)               */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor={jobTitleId} className="text-xs font-semibold text-[#191f28]">
                직무 / 타이틀
              </label>
              <Input
                id={jobTitleId}
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="예: 프론트엔드 개발자"
                maxLength={30}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={locationId} className="text-xs font-semibold text-[#191f28]">
                위치 / 활동 지역
              </label>
              <Input
                id={locationId}
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="예: 서울, 대한민국"
                maxLength={30}
              />
            </div>
          </div>

          {/* ======================================================= */}
          {/* 4. 한 줄 소개 (bio)                                     */}
          {/* ======================================================= */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={bioId} className="text-xs font-semibold text-[#191f28]">
                한 줄 소개 (Bio)
              </label>
              <span className="text-[11px] text-[#8b95a1]">
                {bio.length}/120자
              </span>
            </div>
            <textarea
              id={bioId}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 나타내는 소개 문구를 자유롭게 작성해 보세요."
              maxLength={120}
              rows={2}
              className="w-full rounded-2xl border border-[#d1d6db] bg-white p-3 text-sm text-[#191f28] placeholder-[#8b95a1] transition-all outline-none focus:border-[#3182f6] focus:ring-2 focus:ring-[#3182f6]/20 resize-none font-sans"
            />
          </div>

          {/* ======================================================= */}
          {/* 5. 소셜 링크 확장 섹션 (토글형)                          */}
          {/* ======================================================= */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowSocials(!showSocials)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-[#4e5968] hover:text-[#191f28] cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>소셜 링크 설정</span>
                <span className="text-[11px] font-normal text-[#8b95a1]">
                  (GitHub, 블로그, LinkedIn 등)
                </span>
              </span>
              <span className="text-[11px] text-[#3182f6] underline">
                {showSocials ? "접기 ▲" : "펼치기 ▼"}
              </span>
            </button>

            {showSocials && (
              <div className="mt-2 p-3.5 rounded-2xl bg-[#f9fafb] border border-[#e5e8eb] space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white border border-[#e5e8eb] flex items-center justify-center shrink-0">
                    <GitHubIcon className="w-4 h-4 text-[#191f28]" />
                  </span>
                  <Input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/아이디"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white border border-[#e5e8eb] flex items-center justify-center shrink-0">
                    <VelogIcon className="w-4 h-4 text-[#191f28]" />
                  </span>
                  <Input
                    type="url"
                    value={blog}
                    onChange={(e) => setBlog(e.target.value)}
                    placeholder="https://velog.io/@아이디"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white border border-[#e5e8eb] flex items-center justify-center shrink-0">
                    <LinkedInIcon className="w-4 h-4 text-[#0a66c2]" />
                  </span>
                  <Input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/아이디"
                    className="h-10 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white border border-[#e5e8eb] flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-4 h-4 text-[#e4405f]" />
                  </span>
                  <Input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/아이디"
                    className="h-10 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 에러 피드백 */}
          {saveError && (
            <div className="p-3 rounded-xl bg-[#fff0f1] border border-[#f04452]/20 text-[#f04452] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-2">
            <div className="text-[12px] text-[#8b95a1] min-w-0 truncate">
              {!hasChanges && <span>변경된 내용이 없어요</span>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isSubmitting ||
                  !hasChanges ||
                  duplicateStatus === "checking" ||
                  (name.trim() !== (profile.name || "").trim() && !isNameChecked)
                }
                className="gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>저장하고 있어요...</span>
                  </>
                ) : (
                  <span>수정 완료</span>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
