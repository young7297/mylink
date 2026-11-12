"use client";

import { useState } from "react";

export default function Home() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ydo9902@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4 py-12 relative overflow-hidden font-sans">
      {/* 배경 장식 원형 백드롭 */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 프로필 카드 컨테이너 */}
      <div className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/40 dark:border-zinc-800/60 shadow-2xl rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center transition-all duration-300 hover:shadow-indigo-500/5">
        
        {/* 아바타 영역 */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                DY
              </span>
            </div>
          </div>
          <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" title="Active Now" />
        </div>

        {/* 이름 & 뱃지 */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          윤다영
        </h1>
        
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="px-3 py-1 text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50 rounded-full">
            💻 주니어 개발자
          </span>
          <span className="px-3 py-1 text-xs font-medium bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800/50 rounded-full">
            🌱 지속적인 성장
          </span>
        </div>

        {/* 소개글 */}
        <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed max-w-xs mb-8">
          직관적인 UI와 더 나은 사용자 경험을 고민하는 개발자 윤다영입니다. 배움을 즐기며 의미 있는 가치를 코드로 만들어갑니다. 🚀
        </p>

        {/* 버튼 / 링크 섹션 */}
        <div className="w-full space-y-3">
          <button
            onClick={handleCopyEmail}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{copied ? "이메일 주소가 복사되었습니다! 🎉" : "이메일로 연락하기"}</span>
          </button>

          <a
            href="https://github.com/young7297"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 transition-colors"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub 방문하기</span>
          </a>
        </div>

        {/* 푸터 문구 */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 w-full text-xs text-zinc-400 dark:text-zinc-500">
          © 2026 윤다영. All rights reserved.
        </div>
      </div>
    </main>
  );
}
