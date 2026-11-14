import React from "react";
import {
  Gamepad2,
  BookOpen,
  FileText,
  Mail,
  MessageCircle,
  ExternalLink,
  Link as LinkIconLucide,
  Globe,
  Share2,
  Copy,
  Check,
  Search,
  X,
  SlidersHorizontal,
  FolderGit2,
  Terminal,
  Sparkles,
} from "lucide-react";

export function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.68 1.68 0 1 0 0-3.36 1.68 1.68 0 0 0 0 3.36m1.39 9.74v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

export function FigmaIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 2h4a4 4 0 0 1 0 8H8V2zm0 8h4a4 4 0 0 1 4 4 4 4 0 0 1-4 4H8v-8zm0 8h4a4 4 0 0 1 0 4 4 4 0 0 1-4-4zm-4-8a4 4 0 0 1 4-4v8a4 4 0 0 1-4-4zm0-8a4 4 0 0 1 4-4v8H4a4 4 0 0 1 0-4z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function KakaoTalkIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.87 1.88 5.39 4.73 6.78l-1.2 4.41c-.11.4.34.73.69.5l5.22-3.46c.19.01.37.03.56.03 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
    </svg>
  );
}

export function VelogIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 4h4.5l4.5 12 4.5-12H21l-7.5 17h-3L3 4z" />
    </svg>
  );
}

/**
 * 아이콘 이름 문자열에 따라 알맞은 아이콘 컴포넌트를 반환하는 헬퍼
 */
export function getLinkIcon(iconName?: string, className = "w-4 h-4") {
  const normalized = (iconName || "").toLowerCase().trim();

  switch (normalized) {
    case "github":
      return <GitHubIcon className={className} />;
    case "linkedin":
      return <LinkedInIcon className={className} />;
    case "figma":
      return <FigmaIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "gamepad":
    case "gamepad2":
      return <Gamepad2 className={className} />;
    case "book-open":
    case "book":
    case "blog":
      return <BookOpen className={className} />;
    case "file-text":
    case "notion":
    case "resume":
      return <FileText className={className} />;
    case "mail":
    case "email":
      return <Mail className={className} />;
    case "message-circle":
    case "kakaotalk":
    case "chat":
      return <MessageCircle className={className} />;
    case "codes":
    case "code":
      return <FolderGit2 className={className} />;
    default:
      return <LinkIconLucide className={className} />;
  }
}

/**
 * 카테고리별 하드웨어 테마 컬러 및 뱃지 스타일 헬퍼
 */
export function getCategoryBadgeStyle(category?: string) {
  const norm = (category || "").toLowerCase();
  switch (norm) {
    case "codes":
      return {
        bg: "bg-[#21242e] text-[#ecab37] border border-[#ecab37]/40",
        label: "코드 저장소",
        accent: "#ecab37",
      };
    case "projects":
      return {
        bg: "bg-[#f68d1f] text-white border border-white/40",
        label: "프로젝트",
        accent: "#f68d1f",
      };
    case "skills":
      return {
        bg: "bg-[#3d4f97] text-white border border-[#b8c7ee]/50",
        label: "기술 스택",
        accent: "#3d4f97",
      };
    case "social":
      return {
        bg: "bg-[#8ba1d4] text-[#21242e] border border-[#3d4f97]",
        label: "소셜 링크",
        accent: "#8ba1d4",
      };
    case "contact":
      return {
        bg: "bg-[#206479] text-white border border-[#9fbee7]/40",
        label: "문의처",
        accent: "#206479",
      };
    default:
      return {
        bg: "bg-[#dedede] text-[#21242e] border border-[#3d4f97]",
        label: category || "링크",
        accent: "#7a8aba",
      };
  }
}

export {
  Gamepad2,
  BookOpen,
  FileText,
  Mail,
  MessageCircle,
  ExternalLink,
  LinkIconLucide,
  Globe,
  Share2,
  Copy,
  Check,
  Search,
  X,
  SlidersHorizontal,
  FolderGit2,
  Terminal,
  Sparkles,
};
