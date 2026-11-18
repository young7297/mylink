"use client";

import React, { useState } from "react";
import { UserProfile, SocialLinks } from "@/types/link";
import {
  GitHubIcon,
  LinkedInIcon,
  VelogIcon,
  InstagramIcon,
  GoogleIcon,
  Mail,
  Share2,
  Copy,
  Check,
  Database,
  Pencil,
} from "@/components/icons";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: UserProfile;
  socials: SocialLinks;
  slug: string;
  onShowToast: (message: string) => void;
  onUpdateProfile?: (
    updatedProfile: Partial<UserProfile>,
    updatedSocials?: Partial<SocialLinks>
  ) => Promise<void>;
  isEditable?: boolean;
}

export default function ProfileHeader({
  profile,
  socials,
  slug,
  onShowToast,
  onUpdateProfile,
  isEditable = true,
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCopyUrl = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://young7297.github.io/mylink/${slug}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      onShowToast("링크 주소를 복사했어요");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast(`링크 주소: ${url}`);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://young7297.github.io/mylink/${slug}`;
    const shareData = {
      title: `${profile.name} — 마이페이지`,
      text: `${profile.name}님의 마이페이지 링크 모음이에요.`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onShowToast("페이지 링크를 공유했어요");
      } catch {
        // user cancelled
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleCopyEmail = (email: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      onShowToast(`이메일 주소를 복사했어요: ${email}`);
    } else {
      onShowToast(`이메일: ${email}`);
    }
  };

  return (
    <Card className="w-full p-5 sm:p-6 mb-4">
      {/* 1. 상단 미니 바: 상태 뱃지 및 공유 버튼 */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e8eb]/70">
        <div className="flex items-center gap-2 flex-wrap">
          {profile.isGoogleAuth ? (
            <Badge variant="default" size="sm" className="bg-[#e8f3ff] text-[#3182f6] border border-[#3182f6]/20 font-semibold gap-1">
              <GoogleIcon className="w-3 h-3" />
              <span>Google 인증 사용자</span>
            </Badge>
          ) : (
            <Badge variant="default" size="sm">
              공개 마이페이지
            </Badge>
          )}
          <span className="text-[12px] font-normal text-[#8b95a1]">
            /{slug}
          </span>
        </div>

        {/* 우측 액션: 프로필 수정, 링크 복사 & 공유 */}
        <div className="flex items-center gap-1.5">
          {isEditable && onUpdateProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="gap-1 font-semibold text-xs border-[#d1d6db] hover:border-[#3182f6] hover:bg-[#e8f3ff] text-[#3182f6]"
              title="프로필 수정"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>프로필 수정</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyUrl}
            title="페이지 링크 복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00b569]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">링크 복사</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            title="프로필 공유하기"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>공유</span>
          </Button>
        </div>
      </div>

      {/* 2. 메인 프로필 영역 */}
      <div className="flex items-start gap-4">
        {/* 아바타 */}
        <Avatar size="lg" className="border-2 border-white shadow-toss-1 shrink-0">
          <AvatarImage
            src={profile.avatarUrl || "/profile.png"}
            alt={profile.name}
            priority
          />
        </Avatar>

        {/* 이름 & 소개 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#191f28] tracking-tight">
              {profile.name}
            </h1>
            {profile.jobTitle && (
              <Badge variant="grey" size="xs">
                {profile.jobTitle}
              </Badge>
            )}
            {isEditable && onUpdateProfile && (
              <button
                type="button"
                onClick={() => setIsEditDialogOpen(true)}
                className="p-1 rounded-full text-[#8b95a1] hover:text-[#3182f6] hover:bg-[#e8f3ff] transition-colors cursor-pointer"
                title="프로필 수정"
                aria-label="프로필 정보 수정하기"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 이메일 메타 */}
          {profile.email && (
            <p className="text-[12px] text-[#6b7684] flex items-center gap-1 mb-1 font-medium">
              <Mail className="w-3 h-3 text-[#8b95a1] shrink-0" />
              <span>{profile.email}</span>
            </p>
          )}

          {/* 위치 메타 */}
          {profile.location && (
            <p className="text-[12px] text-[#8b95a1] mb-2">
              📍 {profile.location}
            </p>
          )}

          {/* 한 줄 소개 (해요체) */}
          {profile.bio && (
            <p className="text-[14px] text-[#4e5968] leading-relaxed break-keep">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* 3. Firestore 개인화 경로 표시 영역 (user/{uid}/links) */}
      {profile.uid && (
        <div className="mt-4 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[#475569] min-w-0">
            <Database className="w-3.5 h-3.5 text-[#3182f6] shrink-0" />
            <span className="text-[#64748b] shrink-0 font-medium">개인화 경로:</span>
            <code className="px-1.5 py-0.5 rounded bg-[#e8f3ff] text-[#3182f6] font-mono font-semibold text-[11.5px] truncate">
              user/{profile.uid}/links
            </code>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] shrink-0 font-mono">
            <span>UID:</span>
            <span className="text-[#1e293b] font-medium" title={profile.uid}>
              {profile.uid.slice(0, 8)}...
            </span>
          </div>
        </div>
      )}

      {/* 3. 소셜 링크 칩 바 */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#e5e8eb]/70 flex-wrap">
        {socials.github && (
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
          >
            <Button variant="secondary" size="sm" className="gap-1.5">
              <GitHubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </Button>
          </a>
        )}

        {socials.blog && (
          <a
            href={socials.blog}
            target="_blank"
            rel="noopener noreferrer"
            title="Tech Blog"
          >
            <Button variant="secondary" size="sm" className="gap-1.5">
              <VelogIcon className="w-4 h-4" />
              <span>블로그</span>
            </Button>
          </a>
        )}

        {socials.linkedin && (
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
          >
            <Button variant="secondary" size="sm" className="gap-1.5">
              <LinkedInIcon className="w-4 h-4" />
              <span>LinkedIn</span>
            </Button>
          </a>
        )}

        {socials.instagram && (
          <a
            href={socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
          >
            <Button variant="secondary" size="sm" className="gap-1.5">
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram</span>
            </Button>
          </a>
        )}

        {socials.email && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCopyEmail(socials.email!)}
            title={`이메일 복사: ${socials.email}`}
            className="gap-1.5"
          >
            <Mail className="w-4 h-4" />
            <span>이메일</span>
          </Button>
        )}
      </div>

      {/* 프로필 수정 모달 다이얼로그 */}
      {isEditable && onUpdateProfile && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          profile={profile}
          socials={socials}
          currentUid={profile.uid}
          onSaveProfile={onUpdateProfile}
        />
      )}
    </Card>
  );
}
