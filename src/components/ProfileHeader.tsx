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
  const [avatarIndex, setAvatarIndex] = useState<number>(0);

  // 사용할 아바타 리스트
  const avatars = [
    profile.avatarUrl || "/mario-welcome.svg",
    "/avatar-neo.svg",
    "/profile.png",
  ];

  const currentAvatar = avatars[avatarIndex % avatars.length];

  const handleCopyUrl = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://mylink.kr/${slug}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      onShowToast("공개 링크가 클립보드에 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast(`링크 주소: ${url}`);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://mylink.kr/${slug}`;
    const shareData = {
      title: `${profile.name} — 마이링크 허브`,
      text: `${profile.name}님의 웹 콘솔 링크 모음`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        onShowToast("페이지 링크가 공유되었습니다!");
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
      onShowToast(`이메일 주소가 복사되었습니다: ${email}`);
    } else {
      onShowToast(`이메일: ${email}`);
    }
  };

  return (
    <Card variant="default" className="w-full p-3 sm:p-4 mb-3">
      
      {/* 1. 상단 미니 커맨드 스트립 */}
      <div className="flex items-center justify-between border-b border-[#3d4f97] pb-2 mb-3 text-[#21242e]">
        <div className="flex items-center gap-2">
          {/* 닌텐도 2001 스타일 레드 로고 */}
          <div className="logo-racetrack px-2.5 py-0.5 shadow-sm">
            <span className="font-black text-[11px] tracking-tight text-[#e60012]">
              Nintendo
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#ecab37] uppercase tracking-wider hidden sm:inline">
            링크 허브 콘솔 v1.4
          </span>
        </div>

        {/* 우측 유틸리티 버튼: shadcn/ui Button 적용 */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="xs"
            onClick={handleCopyUrl}
            title="페이지 링크 복사"
          >
            {copied ? <Check className="w-3 h-3 text-[#f68d1f]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">링크 복사</span>
          </Button>

          <Button
            variant="amber"
            size="xs"
            onClick={handleShare}
            title="프로필 공유하기"
          >
            <Share2 className="w-3 h-3" />
            <span>공유하기</span>
          </Button>
        </div>
      </div>

      {/* 2. 메인 프로필 플레이트: 아바타 + 이름 + 소개 */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        
        {/* 아바타: shadcn/ui Avatar 컴포넌트 적용 */}
        <div className="relative group shrink-0">
          <Avatar
            shape="chamfered"
            size="lg"
            onClick={() => setAvatarIndex((prev) => prev + 1)}
            title="클릭하여 아바타 변경"
            className="cursor-pointer hover:border-[#f68d1f] transition-all"
          >
            <AvatarImage src={currentAvatar} alt={profile.name} priority />
          </Avatar>
          
          {/* 아바타 하단 미니 라벨 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <Badge variant="signal" size="xs" className="shadow">
              아바타 변경
            </Badge>
          </div>
        </div>

        {/* 텍스트 메타 정보 */}
        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left min-w-0 w-full">
          
          {/* 역할 & 위치 뱃지 바: shadcn/ui Badge 적용 */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start mb-1">
            {profile.jobTitle && (
              <Badge variant="carbon" size="sm">
                {profile.jobTitle}
              </Badge>
            )}
            {profile.location && (
              <Badge variant="indigo" size="sm">
                📍 {profile.location}
              </Badge>
            )}
            <Badge variant="signal" size="sm">
              온라인 허브
            </Badge>
          </div>

          {/* 볼드 이름 */}
          <h1 className="box-art-text text-2xl sm:text-3xl leading-tight uppercase tracking-tight text-[#21242e]">
            {profile.name}
          </h1>

          {/* 슬러그 주소 */}
          <div className="text-[10px] font-mono text-[#3d4f97] font-bold mt-0.5">
            mylink.kr/<span className="text-[#f68d1f]">{slug}</span>
          </div>

          {/* 소개 문구 음각 웰 (shadcn/ui Card variant="inset") */}
          {profile.bio && (
            <Card variant="inset" className="w-full p-2 sm:p-2.5 mt-2 text-[#21242e] text-xs leading-relaxed font-medium text-left">
              <span className="text-[#f68d1f] font-bold mr-1">“</span>
              {profile.bio}
              <span className="text-[#f68d1f] font-bold ml-1">”</span>
            </Card>
          )}

          {/* 3. 소셜 아이콘 배지 바: shadcn/ui Button(variant="secondary") 적용 */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center sm:justify-start">
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
              >
                <Button variant="secondary" size="icon-sm">
                  <GitHubIcon className="w-4 h-4" />
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
                <Button variant="secondary" size="icon-sm">
                  <VelogIcon className="w-4 h-4" />
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
                <Button variant="secondary" size="icon-sm">
                  <LinkedInIcon className="w-4 h-4" />
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
                <Button variant="secondary" size="icon-sm">
                  <InstagramIcon className="w-4 h-4" />
                </Button>
              </a>
            )}

            {socials.email && (
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={() => handleCopyEmail(socials.email!)}
                title={`Copy Email: ${socials.email}`}
              >
                <Mail className="w-4 h-4" />
              </Button>
            )}
          </div>

        </div>

      </div>

    </Card>
  );
}
