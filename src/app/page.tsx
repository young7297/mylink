"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Toast from "@/components/Toast";

// Tech stack items with authentic Neobrutalism pastel colors
const TECH_STACK = [
  {
    name: "React",
    category: "FRONTEND",
    bg: "bg-[#A5F3FC]",
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="-11.5 -10.23174 23 20.46348" fill="currentColor">
        <circle cx="0" cy="0" r="2.05" fill="#000000" />
        <g stroke="#000000" strokeWidth="1.3" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: "Next.js",
    category: "FRAMEWORK",
    bg: "bg-[#FFFFFF]",
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 180 180" fill="currentColor">
        <circle cx="90" cy="90" fill="black" r="90" />
        <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="white" />
        <rect fill="white" height="72" width="12" x="115" y="54" />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    category: "LANGUAGE",
    bg: "bg-[#BFDBFE]",
    icon: (
      <span className="w-5 h-5 rounded bg-black text-white font-black text-[11px] flex items-center justify-center border border-black">
        TS
      </span>
    ),
  },
  {
    name: "JavaScript",
    category: "LANGUAGE",
    bg: "bg-[#FEF08A]",
    icon: (
      <span className="w-5 h-5 rounded bg-black text-[#FEF08A] font-black text-[11px] flex items-center justify-center border border-black">
        JS
      </span>
    ),
  },
  {
    name: "Tailwind CSS",
    category: "STYLING",
    bg: "bg-[#99F6E4]",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z" />
      </svg>
    ),
  },
  {
    name: "HTML5 / CSS3",
    category: "MARKUP",
    bg: "bg-[#FED7AA]",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L3 5v14l9 3 9-3V5l-9-3zm6.5 15.6L12 19.8l-6.5-2.2V6.6L12 4.4l6.5 2.2v11z"/>
      </svg>
    ),
  },
  {
    name: "Git & GitHub",
    category: "VCS",
    bg: "bg-[#FECDD3]",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    name: "Figma",
    category: "DESIGN",
    bg: "bg-[#E9D5FF]",
    icon: (
      <svg className="w-5 h-5 shrink-0 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4h4V2H8zm8 0h-4v8h4a4 4 0 0 0 0-8zm-8 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4h4v-8H8zm8 0h-4v8a4 4 0 0 0 4-4 4 4 0 0 0 0-4zm-8 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4v-4H8z"/>
      </svg>
    ),
  },
];

// Core values
const CORE_VALUES = [
  {
    num: "01",
    emoji: "💡",
    title: "직관적인 UI / UX",
    tag: "USER FIRST",
    bg: "bg-[#FEF08A]",
    desc: "사용자가 사용법을 고민하지 않고 직관적으로 반응할 수 있는 매끄러운 인터페이스를 만듭니다.",
  },
  {
    num: "02",
    emoji: "⚡",
    title: "지속 가능한 클린 코드",
    tag: "CLEAN CODE",
    bg: "bg-[#BAE6FD]",
    desc: "동료와 미래의 내가 읽고 확장하기 쉬운 모듈화와 컴포넌트 재사용성을 깊이 고민합니다.",
  },
  {
    num: "03",
    emoji: "🤝",
    title: "기록하고 함께 성장",
    tag: "COLLABORATION",
    bg: "bg-[#BBF7D0]",
    desc: "새로운 기술을 학습하고 마주친 문제를 집요하게 파고들어 글로 정리하며 팀과 나눕니다.",
  },
];

export default function Home() {
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" | "info" }>({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [avatarType, setAvatarType] = useState<"neo" | "photo">("neo");
  const [activeTab, setActiveTab] = useState<"links" | "skills" | "about">("links");
  const [cheerCount, setCheerCount] = useState<number>(42);

  // Sync theme
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
    showToast(newDark ? "다크 모드 적용 완료! 🌙" : "라이트 모드 적용 완료! ☀️", "info");
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 2500);
  };

  const handleCopyEmail = () => {
    const email = "ydo9902@gmail.com";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      showToast("이메일 복사 완료! (ydo9902@gmail.com) ✉️");
    } else {
      showToast("이메일: ydo9902@gmail.com", "info");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "윤다영 | 프론트엔드 개발자 프로필",
      text: "주니어 프론트엔드 개발자 윤다영의 네오브루탈리즘 프로필 링크입니다.",
      url: typeof window !== "undefined" ? window.location.href : "https://github.com/young7297",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("프로필이 공유되었습니다! 🚀");
      } catch {
        // user cancel
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("프로필 URL이 클립보드에 복사되었습니다! 🔗");
    }
  };

  const handleCheer = () => {
    setCheerCount((prev) => prev + 1);
    showToast("응원해 주셔서 감사합니다! 힘내서 코딩할게요! 💖");
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start pb-16 font-sans">
      
      {/* 1. Neobrutalist Infinite Marquee Banner Ribbon */}
      <header className="w-full bg-[#FDE047] text-black border-b-[3px] border-black py-2 overflow-hidden select-none z-30 sticky top-0 shadow-[0px_3px_0px_0px_#000]">
        <div className="animate-marquee whitespace-nowrap flex items-center font-black text-xs sm:text-sm tracking-wider uppercase">
          <span className="mx-4">✦ YOON DAYOUNG (윤다영)</span>
          <span className="mx-4 bg-black text-[#FDE047] px-2 py-0.5 rounded">JUNIOR FRONTEND DEVELOPER</span>
          <span className="mx-4">★ OPEN TO WORK</span>
          <span className="mx-4">✦ REACT & NEXT.JS</span>
          <span className="mx-4">★ SEOUL, KOREA</span>
          <span className="mx-4 bg-black text-white px-2 py-0.5 rounded">LET&apos;S CONNECT 🚀</span>
          <span className="mx-4">✦ YOON DAYOUNG (윤다영)</span>
          <span className="mx-4 bg-black text-[#FDE047] px-2 py-0.5 rounded">JUNIOR FRONTEND DEVELOPER</span>
          <span className="mx-4">★ OPEN TO WORK</span>
          <span className="mx-4">✦ REACT & NEXT.JS</span>
          <span className="mx-4">★ SEOUL, KOREA</span>
          <span className="mx-4 bg-black text-white px-2 py-0.5 rounded">LET&apos;S CONNECT 🚀</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-xl sm:max-w-2xl px-3 sm:px-5 mt-6 sm:mt-10">
        
        {/* Neobrutalist Window Card */}
        <div className="w-full bg-white dark:bg-[#18181B] border-[3px] sm:border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] rounded-2xl overflow-hidden transition-all">
          
          {/* Retro Window Title Bar */}
          <div className="bg-[#E2E8F0] dark:bg-[#27272A] border-b-[3px] border-black dark:border-white px-4 py-2.5 flex items-center justify-between select-none">
            {/* Window control buttons */}
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border-2 border-black inline-block shadow-[1px_1px_0px_0px_#000]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border-2 border-black inline-block shadow-[1px_1px_0px_0px_#000]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border-2 border-black inline-block shadow-[1px_1px_0px_0px_#000]" />
            </div>

            {/* Window title */}
            <div className="font-mono font-black text-xs sm:text-sm text-black dark:text-white tracking-wider flex items-center gap-1.5">
              <span>📁</span>
              <span>YOON_DAYOUNG.PROFILE</span>
            </div>

            {/* Window Action Buttons (Share & Theme Toggle) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleShare}
                title="프로필 공유하기"
                aria-label="프로필 공유"
                className="px-2 py-1 rounded bg-[#A7F3D0] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform cursor-pointer"
              >
                🔗 공유
              </button>

              <button
                onClick={toggleTheme}
                title={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
                aria-label="테마 전환"
                className="px-2 py-1 rounded bg-[#FDE047] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform cursor-pointer"
              >
                {isDarkMode ? "☀️ 라이트" : "🌙 다크"}
              </button>
            </div>
          </div>

          {/* Neobrutalist Cover Banner Image */}
          <div className="relative w-full h-36 sm:h-48 border-b-[3px] border-black dark:border-white bg-[#FEF08A] overflow-hidden">
            <Image
              src="/banner-neo.svg"
              alt="Neobrutalist Cover Banner"
              fill
              priority
              className="object-cover object-center select-none"
            />
            {/* Top Floating Badge */}
            <div className="absolute top-3 left-3 -rotate-3 z-10">
              <span className="bg-[#FF6B6B] text-white border-2 border-black font-black text-[11px] sm:text-xs px-2.5 py-1 rounded shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider inline-block">
                ★ 2026 PORTFOLIO
              </span>
            </div>
          </div>

          {/* Profile Identity Body */}
          <div className="p-4 sm:p-7 flex flex-col items-center text-center">
            
            {/* Avatar Frame with Hard Offset Shadow */}
            <div className="relative -mt-16 sm:-mt-20 mb-5 group">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#C084FC] p-1 border-[3px] sm:border-4 border-black shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#fff] -rotate-2 hover:rotate-0 transition-transform duration-200 overflow-hidden">
                <div className="w-full h-full rounded-xl bg-white dark:bg-zinc-900 border-2 border-black overflow-hidden relative flex items-center justify-center">
                  <Image
                    src={avatarType === "neo" ? "/avatar-neo.svg" : "/profile.png"}
                    alt="윤다영 아바타"
                    width={144}
                    height={144}
                    priority
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              </div>

              {/* Avatar Switcher Button */}
              <button
                onClick={() => setAvatarType((prev) => (prev === "neo" ? "photo" : "neo"))}
                title="아바타 이미지 변경"
                className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#FDE047] text-black border-2 border-black px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer whitespace-nowrap"
              >
                {avatarType === "neo" ? "📷 사진으로 전환" : "🎨 일러스트 전환"}
              </button>
            </div>

            {/* Name & Title Section */}
            <div className="flex flex-col items-center mt-2 mb-3">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black dark:text-white">
                  윤다영
                </h1>
                <span className="bg-[#BAE6FD] text-black border-2 border-black font-black text-xs px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_0px_#000] rotate-2">
                  FRONTEND
                </span>
              </div>
              <p className="font-mono font-bold text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 uppercase tracking-wider">
                DAYOUNG YOON
              </p>
            </div>

            {/* Status Sticker Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 bg-[#86EFAC] text-black border-2 border-black font-black text-xs px-3.5 py-1.5 rounded-full shadow-[3px_3px_0px_0px_#000]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-black animate-ping" />
                <span>OPEN TO WORK / 적극 구직 중</span>
              </span>
            </div>

            {/* Pill Tags Row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-md">
              <span className="px-3 py-1 text-xs font-extrabold bg-[#DDD6FE] text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] -rotate-1">
                💻 주니어 개발자
              </span>
              <span className="px-3 py-1 text-xs font-extrabold bg-[#FBCFE8] text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] rotate-1">
                🌱 지속적인 성장
              </span>
              <span className="px-3 py-1 text-xs font-extrabold bg-[#FEF08A] text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] -rotate-1">
                📍 Seoul, KR
              </span>
            </div>

            {/* Speech Bubble / Bio Box */}
            <div className="relative w-full max-w-lg mb-6 text-left">
              <div className="bg-[#FFFDF8] dark:bg-[#202024] border-[3px] border-black dark:border-white p-4 rounded-xl shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                {/* Yellow tape sticker accent */}
                <div className="absolute -top-3 left-6 w-20 h-5 bg-[#FDE047] border-2 border-black -rotate-2 opacity-95" />
                <p className="text-sm sm:text-base font-bold text-black dark:text-white leading-relaxed break-keep mt-1">
                  직관적인 UI와 더 나은 사용자 경험을 치열하게 고민하는 주니어 개발자 윤다영입니다. 배움을 즐기며 코드 한 줄로 의미 있는 가치를 만듭니다. 🚀
                </p>
              </div>
            </div>

            {/* Neobrutalist Navigation Tabs */}
            <nav aria-label="프로필 탭 메뉴" className="w-full grid grid-cols-3 gap-2 sm:gap-3 mb-6 max-w-md">
              <button
                onClick={() => setActiveTab("links")}
                className={`py-2.5 text-xs sm:text-sm font-black rounded-xl border-[3px] border-black transition-all cursor-pointer ${
                  activeTab === "links"
                    ? "bg-[#38BDF8] text-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-[#F1F5F9] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-[2px_2px_0px_0px_#000] hover:bg-white"
                }`}
              >
                🔗 주요 링크
              </button>
              <button
                onClick={() => setActiveTab("skills")}
                className={`py-2.5 text-xs sm:text-sm font-black rounded-xl border-[3px] border-black transition-all cursor-pointer ${
                  activeTab === "skills"
                    ? "bg-[#DDD6FE] text-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-[#F1F5F9] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-[2px_2px_0px_0px_#000] hover:bg-white"
                }`}
              >
                🛠️ 기술 스택
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={`py-2.5 text-xs sm:text-sm font-black rounded-xl border-[3px] border-black transition-all cursor-pointer ${
                  activeTab === "about"
                    ? "bg-[#FBCFE8] text-black shadow-[4px_4px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                    : "bg-[#F1F5F9] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-[2px_2px_0px_0px_#000] hover:bg-white"
                }`}
              >
                💡 핵심 가치
              </button>
            </nav>

            {/* TAB 1: Links Section */}
            {activeTab === "links" && (
              <div className="w-full space-y-3.5 text-left">
                
                {/* 1. GitHub Card */}
                <a
                  href="https://github.com/young7297"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 rounded-xl bg-white dark:bg-[#202024] border-[3px] border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_0px_#000] dark:hover:shadow-[7px_7px_0px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-between group cursor-pointer block"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0 group-hover:bg-[#FDE047] group-hover:text-black transition-colors">
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-black dark:text-white">
                          GitHub 저장소
                        </span>
                        <span className="bg-[#BAE6FD] text-black border border-black text-[10px] font-black px-1.5 py-0.2 rounded">
                          @young7297
                        </span>
                      </div>
                      <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        오픈소스 기여 및 프로젝트 코드 둘러보기
                      </p>
                    </div>
                  </div>

                  <span className="bg-[#FEF08A] text-black border-2 border-black font-black text-xs px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_0px_#000] shrink-0 group-hover:bg-[#4ADE80] transition-colors">
                    방문하기 →
                  </span>
                </a>

                {/* 2. Email Interactive Card */}
                <div className="w-full p-4 rounded-xl bg-[#FCE7F3] dark:bg-[#202024] border-[3px] border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#F43F5E] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-black text-base text-black dark:text-white block">
                        이메일 문의
                      </span>
                      <span className="font-mono text-xs font-extrabold text-neutral-700 dark:text-neutral-300">
                        ydo9902@gmail.com
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyEmail}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-[#FDE047] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                      주소 복사 📋
                    </button>
                    <a
                      href="mailto:ydo9902@gmail.com"
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-[#38BDF8] text-black border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center"
                    >
                      메일 쓰기 ✉️
                    </a>
                  </div>
                </div>

                {/* 3. Tech Blog Card */}
                <div className="w-full p-4 rounded-xl bg-[#EDE9FE] dark:bg-[#202024] border-[3px] border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-black dark:text-white">
                          기술 블로그 & 회고
                        </span>
                        <span className="bg-[#FEF08A] text-black border border-black text-[10px] font-black px-1.5 py-0.2 rounded">
                          기록 중 ✍️
                        </span>
                      </div>
                      <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        배운 기술과 트러블슈팅 경험을 기록합니다
                      </p>
                    </div>
                  </div>
                  <span className="bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black text-xs font-black px-2.5 py-1 rounded shadow-[2px_2px_0px_0px_#000] shrink-0">
                    COMING SOON
                  </span>
                </div>

                {/* 4. Portfolio Projects Card */}
                <div className="w-full p-4 rounded-xl bg-[#FEF9C3] dark:bg-[#202024] border-[3px] border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#fff] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                      <span className="text-2xl">📁</span>
                    </div>
                    <div>
                      <span className="font-black text-base text-black dark:text-white block">
                        프로젝트 포트폴리오
                      </span>
                      <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        사용자 중심 웹 애플리케이션 개발 목록
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#4ADE80] text-black border-2 border-black text-xs font-black px-2.5 py-1 rounded shadow-[2px_2px_0px_0px_#000] shrink-0">
                    PREPARING
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: Skills Section */}
            {activeTab === "skills" && (
              <div className="w-full space-y-4 text-left">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TECH_STACK.map((tech) => (
                    <div
                      key={tech.name}
                      className={`${tech.bg} p-3.5 rounded-xl border-[3px] border-black text-black shadow-[4px_4px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000] transition-all flex flex-col justify-between group`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                          {tech.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase font-mono bg-black text-white px-1.5 py-0.5 rounded">
                          {tech.category}
                        </span>
                      </div>
                      <span className="font-black text-sm text-black tracking-tight mt-1">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Skill Manifesto Box */}
                <div className="p-4 rounded-xl bg-[#FEF08A] text-black border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
                  <p className="font-black text-xs sm:text-sm flex items-center gap-2">
                    <span className="text-base">🚀</span>
                    <span>SKILL NOTE:</span>
                  </p>
                  <p className="text-xs sm:text-sm font-bold mt-1 leading-relaxed">
                    시맨틱 마크업과 반응형 웹 표준을 탄탄히 다지며, 컴포넌트 재사용성과 성능 최적화에 깊은 관심을 두고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: About & Values Section */}
            {activeTab === "about" && (
              <div className="w-full space-y-3.5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CORE_VALUES.map((val) => (
                    <div
                      key={val.title}
                      className={`${val.bg} p-4 rounded-xl border-[3px] border-black text-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between hover:-translate-y-0.5 transition-transform`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{val.emoji}</span>
                          <span className="font-mono font-black text-xs bg-black text-white px-1.5 py-0.5 rounded">
                            {val.num}
                          </span>
                        </div>
                        <h2 className="font-black text-sm text-black mb-1">
                          {val.title}
                        </h2>
                        <p className="text-xs font-bold text-neutral-800 leading-relaxed">
                          {val.desc}
                        </p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-neutral-600 mt-3 pt-2 border-t-2 border-black/30">
                        {val.tag}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Philosophy Manifesto Card */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#202024] border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff]">
                  <span className="bg-[#FF6B6B] text-white border-2 border-black font-black text-xs px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#000] inline-block mb-2">
                    💬 DEV PROMISE
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-black dark:text-white leading-relaxed">
                    사용자가 마주하는 첫 화면부터 작은 버튼의 클릭 경험까지 사소한 디테일 하나도 놓치지 않는 세심한 개발자가 되고자 합니다. 문제에 부딪힐 때마다 즐겁게 파고드는 끈기로 가치를 창출합니다.
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Cheer Button */}
            <div className="w-full mt-6 pt-5 border-t-[3px] border-black/20 dark:border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base">☕</span>
                <span className="font-black text-xs text-black dark:text-white">
                  윤다영 개발자를 응원해주세요!
                </span>
              </div>

              <button
                onClick={handleCheer}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F43F5E] text-white border-[3px] border-black font-black text-xs shadow-[3px_3px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>💖 응원 보내기</span>
                <span className="bg-white text-black px-1.5 py-0.5 rounded text-[10px] font-black">
                  {cheerCount}
                </span>
              </button>
            </div>

            {/* Footer Area */}
            <div className="mt-6 pt-4 border-t-[3px] border-black dark:border-white w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-black text-black dark:text-white">
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded">
                © 2026 YOON DAYOUNG ✦ ALL RIGHTS RESERVED
              </span>

              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/young7297"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#BAE6FD] text-black border-2 border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_#000] hover:-translate-y-0.5 transition-transform"
                >
                  GitHub
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="bg-[#FEF08A] text-black border-2 border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_#000] hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  Email
                </button>
                <button
                  onClick={handleShare}
                  className="bg-[#A7F3D0] text-black border-2 border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_#000] hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  Share
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Neobrutalist Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </main>
  );
}
