"use client";

import React from "react";
import { LinkItem } from "@/types/link";
import { getLinkIcon, getCategoryBadgeStyle, ChevronRight } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

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
      className={`group relative w-full select-none transition-all duration-150 rounded-2xl ${
        isActive
          ? "cursor-pointer hover:bg-[#f9fafb] active:bg-[#f2f4f6]"
          : "cursor-not-allowed opacity-45"
      }`}
    >
      <div className="flex items-center justify-between p-3.5 sm:p-4 gap-3">
        {/* 좌측: 44px 아바타/아이콘 컨테이너 + 텍스트 */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* TDS ListRow 44px 아이콘 웰 */}
          <div
            className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              isActive
                ? "bg-[#e8f3ff] text-[#3182f6]"
                : "bg-[#f2f4f6] text-[#8b95a1]"
            }`}
          >
            {getLinkIcon(link.icon, "w-5 h-5")}
          </div>

          {/* 본문 정보 */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            {/* 상단 메타 라인 */}
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span
                className={`text-[11px] font-medium px-1.5 py-0.2 rounded ${badgeStyle.bg}`}
              >
                {badgeStyle.label}
              </span>

              {!isActive && (
                <Badge variant="red" size="xs">
                  준비 중
                </Badge>
              )}
            </div>

            {/* 제목 (16px 600) */}
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-[#191f28] leading-snug truncate group-hover:text-[#3182f6] transition-colors">
              {link.title}
            </h3>

            {/* 설명 문구 (13px 400 grey-600) */}
            {link.description && (
              <p className="text-[13px] text-[#6b7684] leading-relaxed line-clamp-1 mt-0.5">
                {link.description}
              </p>
            )}

            {/* 도메인 주소 */}
            <div className="text-[11px] text-[#8b95a1] font-normal truncate mt-0.5">
              {displayHost}
            </div>
          </div>
        </div>

        {/* 우측: TDS Chevron Right 화살표 */}
        <div className="shrink-0 flex items-center justify-center pl-1">
          <ChevronRight className="w-5 h-5 text-[#b0b8c1] group-hover:text-[#3182f6] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
