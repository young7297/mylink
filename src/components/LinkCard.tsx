"use client";

import React from "react";
import { LinkItem } from "@/types/link";
import { getLinkIcon, getCategoryBadgeStyle } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LinkCardProps {
  link: LinkItem;
  index: number;
  onOpenLink?: (link: LinkItem) => void;
}

export default function LinkCard({ link, index, onOpenLink }: LinkCardProps) {
  const badgeStyle = getCategoryBadgeStyle(link.category);
  const isActive = link.active !== false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isActive) return;
    if (onOpenLink) {
      onOpenLink(link);
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  // URL에서 도메인만 깔끔하게 추출 (표시용)
  const displayHost = (() => {
    try {
      if (link.url.startsWith("mailto:")) {
        return link.url.replace("mailto:", "");
      }
      const u = new URL(link.url);
      return u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      return link.url;
    }
  })();

  // Badge variant 매핑
  const getBadgeVariant = (cat?: string) => {
    const norm = (cat || "").toLowerCase();
    if (norm === "codes") return "carbon";
    if (norm === "projects") return "signal";
    if (norm === "skills") return "indigo";
    if (norm === "social") return "periwinkle";
    return "default";
  };

  return (
    <div
      role="link"
      tabIndex={isActive ? 0 : -1}
      aria-disabled={!isActive}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && isActive) {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={`group relative w-full select-none transition-all duration-150 ${
        isActive
          ? "cursor-pointer hover:-translate-y-0.5 active:translate-y-0.5"
          : "cursor-not-allowed opacity-65"
      }`}
    >
      {/* shadcn/ui Card 기반 베벨 플레이트 */}
      <Card
        variant="inset"
        className={`p-2 sm:p-2.5 transition-colors ${
          isActive
            ? "bg-[#dedede] hover:bg-white"
            : "bg-[#b8c2d8] border-[#60619c]"
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-3">
          
          {/* 좌측: 인셋 아이콘 웰 */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 inset-plate flex items-center justify-center transition-transform group-hover:scale-105 ${
                isActive ? "bg-[#3d4f97] text-[#dedede]" : "bg-[#60619c] text-gray-400"
              }`}
            >
              {getLinkIcon(link.icon, "w-5 h-5 sm:w-6 sm:h-6")}
            </div>

            {/* 본문 정보 */}
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              
              {/* 상단 메타 라인: shadcn/ui Badge 적용 */}
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <Badge variant="platinum" size="xs" className="font-mono text-[#60619c]">
                  채널-{String(index + 1).padStart(2, "0")}
                </Badge>

                <Badge variant={getBadgeVariant(link.category)} size="xs">
                  {badgeStyle.label}
                </Badge>

                {!isActive && (
                  <Badge variant="destructive" size="xs">
                    준비 중 · 비공개
                  </Badge>
                )}
              </div>

              {/* 제목 */}
              <h3 className="text-xs sm:text-[13px] font-extrabold text-[#21242e] leading-snug truncate group-hover:text-[#3d4f97] transition-colors">
                {link.title}
              </h3>

              {/* 설명 문구 */}
              {link.description && (
                <p className="text-[10px] sm:text-[11px] text-[#21242e]/75 leading-tight line-clamp-1 mt-0.5">
                  {link.description}
                </p>
              )}

              {/* 대상 URL 도메인 주소 */}
              <div className="flex items-center gap-1 text-[9px] font-mono text-[#3d4f97] mt-0.5 truncate">
                <span className="text-[#f68d1f]">▶</span>
                <span className="truncate">{displayHost}</span>
              </div>
            </div>
          </div>

          {/* 우측: shadcn/ui Button 기반 콘솔 버튼 액션 디스크 */}
          <div className="shrink-0 flex items-center self-center pl-1">
            <Button
              variant={isActive ? "default" : "secondary"}
              size="icon-disc"
              className={`w-7 h-7 sm:w-8 sm:h-8 p-0 text-[10px] sm:text-xs font-black ${
                !isActive && "opacity-50 cursor-not-allowed"
              }`}
              title={isActive ? "새 탭에서 링크 열기" : "비활성화된 링크"}
            >
              ▶
            </Button>
          </div>

        </div>
      </Card>
    </div>
  );
}
