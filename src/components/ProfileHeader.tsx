"use client";

import React, { useState } from "react";
import { UserProfile, SocialLinks } from "@/types/link";
import {
  GitHubIcon,
  LinkedInIcon,
  VelogIcon,
  InstagramIcon,
  Mail,
  Share2,
  Copy,
  Check,
} from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: UserProfile;
  socials: SocialLinks;
  slug: string;
  onShowToast: (message: string) => void;
}

export default function ProfileHeader({
  profile,
  socials,
  slug,
  onShowToast,
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);

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
      title: `${profile.name} — 마이링크`,
      text: `${profile.name}님의 링크 허브예요.`,
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
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            공개 링크 허브
          </Badge>
          <span className="text-[12px] font-normal text-[#8b95a1]">
            /{slug}
          </span>
        </div>

        {/* 우측 액션: 링크 복사 & 공유 */}
        <div className="flex items-center gap-1.5">
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
          </div>

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
    </Card>
  );
}
