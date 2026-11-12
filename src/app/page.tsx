"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Toast from "@/components/Toast";

// Tech stack data with colored badges and icons
const TECH_STACK = [
  {
    name: "React",
    category: "Frontend",
    color: "from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="-11.5 -10.23174 23 20.46348" fill="currentColor">
        <circle cx="0" cy="0" r="2.05" fill="#00d8ff" />
        <g stroke="#00d8ff" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: "Next.js",
    category: "Framework",
    color: "from-zinc-500/10 to-neutral-500/10 text-zinc-700 dark:text-zinc-200 border-zinc-500/20",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 180 180" fill="currentColor">
        <mask height="180" id="mask0" maskUnits="userSpaceOnUse" width="180" x="0" y="0" style={{ maskType: "alpha" }}>
          <circle cx="90" cy="90" fill="black" r="90" />
        </mask>
        <g mask="url(#mask0)">
          <circle cx="90" cy="90" data-framer-name="circle" fill="currentColor" r="90" />
          <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="white" />
          <rect fill="white" height="72" width="12" x="115" y="54" />
        </g>
      </svg>
    ),
  },
  {
    name: "TypeScript",
    category: "Language",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: (
      <span className="w-4 h-4 rounded bg-[#3178C6] text-white font-bold text-[10px] flex items-center justify-center leading-none">
        TS
      </span>
    ),
  },
  {
    name: "JavaScript",
    category: "Language",
    color: "from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: (
      <span className="w-4 h-4 rounded bg-[#F7DF1E] text-black font-bold text-[10px] flex items-center justify-center leading-none">
        JS
      </span>
    ),
  },
  {
    name: "Tailwind CSS",
    category: "Styling",
    color: "from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    icon: (
      <svg className="w-4 h-4 shrink-0 text-[#38BDF8]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
      </svg>
    ),
  },
  {
    name: "HTML5 / CSS3",
    category: "Markup",
    color: "from-orange-500/10 to-red-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    icon: (
      <svg className="w-4 h-4 shrink-0 text-[#E34F26]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L3 5v14l9 3 9-3V5l-9-3zm6.5 15.6L12 19.8l-6.5-2.2V6.6L12 4.4l6.5 2.2v11z"/>
      </svg>
    ),
  },
  {
    name: "Git & GitHub",
    category: "Version Control",
    color: "from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    icon: (
      <svg className="w-4 h-4 shrink-0 text-[#F05032]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2.6 10.59L8.38 4.8a2.53 2.53 0 0 1 3.58 0l2.45 2.45-2.18 2.18a1.9 1.9 0 0 0-1.85.45 1.9 1.9 0 0 0-.46 1.86l-2.07 2.07a1.9 1.9 0 0 0-1.86.46 1.91 1.91 0 0 0 0 2.7 1.91 1.91 0 0 0 2.7 0 1.9 1.9 0 0 0 .46-1.86l2.02-2.02a1.93 1.93 0 0 0 1.25.13 1.9 1.9 0 0 0 1.25-.79l2.23-2.23 4.25 4.25a2.53 2.53 0 0 1 0 3.58l-5.78 5.79a2.53 2.53 0 0 1-3.58 0L2.6 14.17a2.53 2.53 0 0 1 0-3.58z"/>
      </svg>
    ),
  },
  {
    name: "Figma",
    category: "Design Tool",
    color: "from-pink-500/10 to-rose-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    icon: (
      <svg className="w-4 h-4 shrink-0 text-[#F24E1E]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4h4V2H8zm8 0h-4v8h4a4 4 0 0 0 0-8zm-8 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4h4v-8H8zm8 0h-4v8a4 4 0 0 0 4-4 4 4 0 0 0 0-4zm-8 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4v-4H8z"/>
      </svg>
    ),
  },
];

// Core values
const CORE_VALUES = [
  {
    emoji: "💡",
    title: "직관적인 UI / UX",
    desc: "사용자의 입장에서 생각하며 편리하고 자연스러운 흐름을 만듭니다.",
  },
  {
    emoji: "⚡",
    title: "지속 가능한 코드",
    desc: "가독성이 높고 유지보수하기 쉬운 컴포넌트 구조를 설계합니다.",
  },
  {
    emoji: "🤝",
    title: "성장과 공유",
    desc: "새로운 기술을 탐구하고 학습한 지식을 기록하며 팀과 함께 성장합니다.",
  },
];

export default function Home() {
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [avatarType, setAvatarType] = useState<"illustration" | "photo">("illustration");
  const [activeTab, setActiveTab] = useState<"links" | "skills" | "about">("links");

  // Initialize theme from system or localStorage
  useEffect(() => {
    const isDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
    showToast(newDark ? "다크 모드가 적용되었습니다 🌙" : "라이트 모드가 적용되었습니다 ☀️", "info");
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 2400);
  };

  const handleCopyEmail = () => {
    const email = "ydo9902@gmail.com";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      showToast("이메일 주소가 복사되었습니다! 🎉 (ydo9902@gmail.com)");
    } else {
      showToast("이메일 주소: ydo9902@gmail.com", "info");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "윤다영 | 개발자 프로필",
      text: "주니어 프론트엔드 개발자 윤다영의 프로필 링크입니다.",
      url: typeof window !== "undefined" ? window.location.href : "https://github.com/young7297",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("프로필이 공유되었습니다! ✨");
      } catch {
        // User cancelled share
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("프로필 링크가 클립보드에 복사되었습니다! 🔗");
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-3.5 py-6 sm:px-6 sm:py-12 md:py-16 relative overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Decorative ambient background blur orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/3 w-80 sm:w-[28rem] h-80 sm:h-[28rem] bg-purple-500/15 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-pink-500/15 dark:bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Profile Card Container */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/80 dark:border-zinc-800/80 shadow-2xl shadow-indigo-500/5 dark:shadow-black/40 rounded-3xl sm:rounded-[2.25rem] overflow-hidden transition-all duration-300 flex flex-col">
        
        {/* Cover Banner Area */}
        <div className="relative w-full h-36 sm:h-44 md:h-48 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
          <Image
            src="/banner.svg"
            alt="Profile Banner"
            fill
            priority
            className="object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          {/* Top Bar Floating Controls */}
          <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-5 flex items-center justify-between z-10">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-white/40 dark:border-zinc-700/50 text-[11px] sm:text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>새로운 기회에 열려있어요</span>
            </div>

            {/* Quick Action Buttons (Share & Theme Toggle) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleShare}
                aria-label="프로필 공유하기"
                title="프로필 공유하기"
                className="p-2 sm:p-2.5 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-white/40 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>

              <button
                onClick={toggleTheme}
                aria-label="다크 모드 전환"
                title={isDarkMode ? "라이트 모드로 변경" : "다크 모드로 변경"}
                className="p-2 sm:p-2.5 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-white/40 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                {isDarkMode ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="px-5 sm:px-8 pb-8 pt-0 flex flex-col items-center text-center">
          
          {/* Avatar Area with Image Switcher */}
          <div className="relative -mt-14 sm:-mt-16 md:-mt-18 mb-4 group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full p-[3px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-purple-500/25 transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 overflow-hidden relative border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                <Image
                  src={avatarType === "illustration" ? "/avatar.svg" : "/profile.png"}
                  alt="윤다영 개발자 프로필 사진"
                  width={144}
                  height={144}
                  priority
                  className="w-full h-full object-cover select-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Active Status Badge on Avatar */}
            <span
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full shadow-md"
              title="활동 중"
            />

            {/* Avatar Switcher Pill Button */}
            <button
              onClick={() =>
                setAvatarType((prev) => (prev === "illustration" ? "photo" : "illustration"))
              }
              title="프로필 이미지 스타일 변경"
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-90 hover:opacity-100 px-2 py-0.5 rounded-full bg-zinc-900/80 dark:bg-zinc-100/90 text-white dark:text-zinc-900 text-[10px] font-medium tracking-tight shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              {avatarType === "illustration" ? "📷 사진 보기" : "🎨 일러스트"}
            </button>
          </div>

          {/* Name & Title */}
          <div className="flex flex-col items-center mt-2 mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                윤다영
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                Frontend
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mt-1">
              Dayoung Yoon
            </p>
          </div>

          {/* Category Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4 max-w-md">
            <span className="px-3 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-full flex items-center gap-1">
              💻 주니어 개발자
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800/50 rounded-full flex items-center gap-1">
              🌱 지속적인 성장
            </span>
            <span className="px-3 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 rounded-full flex items-center gap-1">
              📍 Seoul, KR
            </span>
          </div>

          {/* Bio Description */}
          <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed max-w-md mb-6 break-keep">
            직관적인 UI와 더 나은 사용자 경험을 고민하는 개발자 윤다영입니다. 배움을 즐기며 의미 있는 가치를 코드로 만들어갑니다. 🚀
          </p>

          {/* Navigation Tabs (반응형 탭 메뉴) */}
          <div className="w-full flex p-1 mb-6 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/50 max-w-md">
            <button
              onClick={() => setActiveTab("links")}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "links"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              🔗 주요 링크
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "skills"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              🛠️ 기술 스택
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === "about"
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              💡 가치관 & 소개
            </button>
          </div>

          {/* Tab 1: Links Section */}
          {activeTab === "links" && (
            <div className="w-full space-y-3 animate-in fade-in duration-300">
              {/* GitHub Card Link */}
              <a
                href="https://github.com/young7297"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        GitHub 저장소
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                        @young7297
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      오픈소스 및 토이 프로젝트, 코드 기록 둘러보기
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              {/* Email Copy & Send Card */}
              <div className="w-full p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 block">
                      이메일 문의
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      ydo9902@gmail.com
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyEmail}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-600/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    주소 복사
                  </button>
                  <a
                    href="mailto:ydo9902@gmail.com"
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-500/20 text-center active:scale-95"
                  >
                    메일 쓰기
                  </a>
                </div>
              </div>

              {/* Developer Blog Link */}
              <div className="w-full p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between text-left group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                        기술 블로그 & 회고
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 font-medium">
                        기록 중
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      새롭게 배운 기술과 문제 해결 과정을 기록합니다
                    </p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400 font-medium">Coming soon</span>
              </div>
            </div>
          )}

          {/* Tab 2: Skills Section */}
          {activeTab === "skills" && (
            <div className="w-full space-y-4 animate-in fade-in duration-300 text-left">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TECH_STACK.map((tech) => (
                  <div
                    key={tech.name}
                    className="p-3 rounded-xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 hover:border-indigo-400/50 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm">
                        {tech.icon}
                      </div>
                      <span className="text-[10px] text-zinc-400 uppercase font-mono">
                        {tech.category}
                      </span>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Learning note */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/50 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2.5">
                <span className="text-base shrink-0">🚀</span>
                <span>
                  기초적인 웹 표준과 반응형 레이아웃 구현을 탄탄히 다지며, 컴포넌트 재사용성과 성능 최적화에 깊은 관심을 가지고 공부하고 있습니다.
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: About & Values Section */}
          {activeTab === "about" && (
            <div className="w-full space-y-3 animate-in fade-in duration-300 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CORE_VALUES.map((val) => (
                  <div
                    key={val.title}
                    className="p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex flex-col items-start hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    <span className="text-2xl mb-2">{val.emoji}</span>
                    <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                      {val.title}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mini Timeline or Philosophy */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-800/30 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  💬 개발자로서의 다짐
                </p>
                사용자가 마주하는 첫 화면부터 작은 버튼의 인터랙션까지, 사소한 디테일 하나도 놓치지 않는 세심한 개발자가 되고자 합니다. 문제에 부딪힐 때마다 즐겁게 원인을 파고드는 끈기를 가지고 있습니다.
              </div>
            </div>
          )}

          {/* Footer Area */}
          <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 dark:text-zinc-500">
            <span>© 2026 윤다영. All rights reserved.</span>
            <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              <a
                href="https://github.com/young7297"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                GitHub
              </a>
              <span>•</span>
              <button
                onClick={handleCopyEmail}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Email
              </button>
              <span>•</span>
              <button
                onClick={handleShare}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </main>
  );
}
