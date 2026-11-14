"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Toast from "@/components/Toast";

export default function Home() {
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [pollSelection, setPollSelection] = useState<string>("1");
  const [pollVoted, setPollVoted] = useState<boolean>(false);
  const [searchCategory, setSearchCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [avatarView, setAvatarView] = useState<"mario" | "photo">("mario");

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2800);
  };

  const handleCopyEmail = () => {
    const email = "ydo9902@gmail.com";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      showToast("이메일 주소가 복사되었습니다: ydo9902@gmail.com");
    } else {
      showToast("이메일: ydo9902@gmail.com");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Nintendo.com (2001) - 윤다영 웹 콘솔",
      text: "윤다영의 Y2K 웹 콘솔 하드웨어 프로필을 확인해 보세요.",
      url: typeof window !== "undefined" ? window.location.href : "https://github.com/young7297",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("페이지 링크가 공유되었습니다!");
      } catch {
        // cancelled
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("페이지 주소가 클립보드에 복사되었습니다!");
    }
  };

  const handlePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPollVoted(true);
    showToast("플레이어 투표: 소중한 의견이 등록되었습니다. 감사합니다!");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`검색 진행: "${searchQuery}" [카테고리: ${searchCategory}]`);
    } else {
      showToast("검색할 키워드를 입력해 주세요.");
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start py-4 px-2 sm:px-4 font-sans select-none">
      
      {/* ========================================================= */}
      {/* 1. 상단 마스트헤드 영역: 마리오 환영 그래픽 & 검색 모듈   */}
      {/* ========================================================= */}
      <header className="w-full max-w-[830px] flex flex-col sm:flex-row items-center justify-between gap-3 mb-2 px-1">
        
        {/* 마리오 환영 그래픽 */}
        <div className="flex items-center">
          <Image
            src="/mario-welcome.svg"
            alt="마리오 환영 그래픽"
            width={240}
            height={90}
            priority
            className="h-[75px] sm:h-[82px] w-auto drop-shadow-sm select-none"
          />
        </div>

        {/* 상단 검색 & 카테고리 선택 바 */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-1.5 bg-[#7a8aba] bevel-plate p-1.5"
        >
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold tracking-[0.5px] uppercase text-[#21242e] whitespace-nowrap">
              검색:
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트, 기술, 키워드..."
              className="bg-white text-[#21242e] text-xs px-2 py-1 inset-plate-subtle w-36 sm:w-44 focus:outline-none font-sans"
            />
          </div>

          <div className="flex items-center gap-1">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-white text-[#21242e] text-xs px-1.5 py-1 inset-plate-subtle border border-[#21242e] cursor-pointer"
            >
              <option value="all">전체 카테고리</option>
              <option value="projects">프로젝트</option>
              <option value="skills">기술 스택</option>
              <option value="codes">코드 저장소</option>
            </select>

            {/* 앰버 색상 검색 버튼 */}
            <button
              type="submit"
              className="bg-[#ecab37] hover:bg-[#e48600] active:bg-[#f68d1f] text-[#21242e] text-[11px] font-bold px-3 py-1 rounded-[2px] bevel-button uppercase tracking-[0.5px] cursor-pointer"
            >
              검색
            </button>
          </div>
        </form>
      </header>


      {/* ========================================================= */}
      {/* 2. 섀시 본체: 2001 페리윙클 하드웨어 인클로저            */}
      {/* ========================================================= */}
      <div className="w-full max-w-[830px] bg-[#7a8aba] bevel-plate chamfered-box shadow-2xl relative">
        
        {/* 상단 듀얼 내비게이션 바 */}
        <div className="w-full flex flex-col">
          
          {/* 1차 카본 내비게이션 바 */}
          <nav aria-label="메인 내비게이션" className="carbon-halftone h-10 border-b border-[#3d4f97] px-2 sm:px-3 flex items-center justify-between text-white">
            
            {/* 닌텐도 레이스트랙 캡슐 로고 */}
            <div className="flex items-center gap-2">
              <div className="logo-racetrack px-3 py-0.5 flex items-center justify-center shadow-sm">
                <span className="font-black text-[13px] tracking-tight text-[#e60012]">
                  Nintendo
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#ecab37] uppercase tracking-[0.5px] hidden sm:inline">
                2001 콘솔 에디션
              </span>
            </div>

            {/* 골드 강조 메인 메뉴 */}
            <ul className="flex items-center gap-2 sm:gap-4 font-bold text-xs sm:text-[13px] tracking-[0.5px]">
              <li>
                <a
                  href="#projects"
                  className="text-[#e48600] hover:text-[#f68d1f] hover:underline transition-colors"
                >
                  프로젝트
                </a>
              </li>
              <li>
                <a
                  href="#systems"
                  className="text-[#e48600] hover:text-[#f68d1f] hover:underline transition-colors"
                >
                  기술스택
                </a>
              </li>
              <li>
                <a
                  href="#news"
                  className="text-[#e48600] hover:text-[#f68d1f] hover:underline transition-colors"
                >
                  새소식
                </a>
              </li>
              <li>
                <a
                  href="#nsider"
                  className="text-[#e48600] hover:text-[#f68d1f] hover:underline transition-colors"
                >
                  개발노트
                </a>
              </li>
              <li>
                <a
                  href="#downloads"
                  className="text-[#e48600] hover:text-[#f68d1f] hover:underline transition-colors"
                >
                  자료실
                </a>
              </li>
            </ul>

            {/* 우측 앰버 유틸리티 칩 */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/dayoung"
                className="bg-[#f68d1f] hover:bg-[#e48600] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-[2px] bevel-button uppercase cursor-pointer flex items-center gap-1"
              >
                <span>링크 허브</span>
                <span>▶</span>
              </Link>
              <button
                type="button"
                onClick={() => showToast("코드 저장소: 20개 이상의 깃허브 프로젝트 보관 중")}
                className="bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] text-[10px] font-bold px-2 py-0.5 rounded-[2px] bevel-button uppercase cursor-pointer"
              >
                코드 뱅크
              </button>
              <button
                type="button"
                onClick={() => showToast("프로젝트 탐색기: React 19 / Next.js 준비 완료")}
                className="bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] text-[10px] font-bold px-2 py-0.5 rounded-[2px] bevel-button uppercase cursor-pointer"
              >
                프로젝트 탐색
              </button>
            </div>
          </nav>

          {/* 2차 서브 내비게이션 스트립 */}
          <div className="bg-[#9fbee7] border-b border-[#3d4f97] px-3 py-1 flex items-center justify-between text-[#21242e] text-[11px] font-bold tracking-[0.3px] overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-3">
              <a href="#about" className="hover:text-[#3d4f97] hover:underline">서비스 소개</a>
              <span className="text-[#60619c]">|</span>
              <a href="#help" className="hover:text-[#3d4f97] hover:underline">고객지원 &amp; 문의</a>
              <span className="text-[#60619c]">|</span>
              <a href="#corp" className="hover:text-[#3d4f97] hover:underline">프로필 상세</a>
              <span className="text-[#60619c]">|</span>
              <a href="#global" className="hover:text-[#3d4f97] hover:underline">글로벌 네트워크</a>
              <span className="text-[#60619c]">|</span>
              <a href="#privacy" className="hover:text-[#3d4f97] hover:underline">개인정보처리방침</a>
              <span className="text-[#60619c]">|</span>
              <a href="https://github.com/young7297" target="_blank" rel="noopener noreferrer" className="hover:text-[#3d4f97] hover:underline">깃허브 스토어</a>
            </div>
            
            {/* 빠른 주소 공유 버튼 */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={handleShare}
                className="text-[10px] bg-[#21242e] text-white px-2 py-0.5 rounded-[2px] hover:bg-[#3d4f97] cursor-pointer"
              >
                주소 복사
              </button>
            </div>
          </div>
        </div>


        {/* 메인 레이아웃: 좌측 세로 탭 & 2열 본문 */}
        <div className="flex w-full relative">
          
          {/* ========================================================= */}
          {/* 좌측 세로 카본 탭 스트립                                   */}
          {/* ========================================================= */}
          <aside aria-label="섹션 탭" className="hidden md:flex flex-col w-7 carbon-halftone border-r border-[#3d4f97] py-4 gap-12 items-center shrink-0 select-none">
            <div className="-rotate-90 whitespace-nowrap text-[10px] font-bold text-[#9fbee7] tracking-[1px]">
              인기 프로젝트
            </div>
            <div className="-rotate-90 whitespace-nowrap text-[10px] font-bold text-[#9fbee7] tracking-[1px]">
              추천 링크
            </div>
            <div className="-rotate-90 whitespace-nowrap text-[10px] font-bold text-[#9fbee7] tracking-[1px]">
              주요 역량
            </div>
            <div className="-rotate-90 whitespace-nowrap text-[10px] font-bold text-[#9fbee7] tracking-[1px]">
              등급 안내
            </div>
          </aside>


          {/* ========================================================= */}
          {/* 메인 콘텐츠 영역                                         */}
          {/* ========================================================= */}
          <div className="flex-1 p-3 sm:p-4 flex flex-col gap-3">
            
            {/* ------------------------------------------------------- */}
            {/* 히어로 패널: 2001 박스아트 하드웨어 필드                */}
            {/* ------------------------------------------------------- */}
            <section aria-labelledby="hero-title" className="w-full bg-[#acace7] bevel-plate p-3 sm:p-4 rounded-[6px] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* 회로 패턴 워터마크 */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#3d4f97_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* 좌측 타이틀 & 소개 문구 */}
              <div className="relative z-10 flex-1 flex flex-col items-start text-left">
                
                {/* 플랫폼 뱃지 */}
                <div className="inline-flex items-center gap-1.5 bg-[#f68d1f] text-white text-[10px] font-bold px-2 py-0.5 rounded-[2px] bevel-button uppercase mb-2">
                  <span>지원 기기:</span>
                  <span className="bg-[#21242e] text-[#ecab37] px-1 py-0.2 rounded-[1px]">
                    웹 콘솔 어드밴스
                  </span>
                </div>

                {/* 굵은 외곽선 타이틀 */}
                <h1 id="hero-title" className="box-art-text text-3xl sm:text-4xl md:text-5xl leading-none tracking-tight mb-2">
                  윤다영 (Dayoung)
                </h1>

                {/* 히어로 소개 문구 */}
                <p className="text-sm sm:text-[15px] font-bold text-[#21242e] leading-snug mb-3 max-w-md">
                  화려한 비주얼과 손끝에 전해지는 촉각적 피드백, 직관적인 사용자 경험을 엔지니어링하는 웹 프론트엔드 개발자입니다.
                </p>

                {/* 전진 액션 버튼 열 */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/dayoung"
                    className="inline-flex items-center gap-2 bg-[#f68d1f] hover:bg-[#e48600] active:bg-[#e60012] text-white text-xs font-extrabold px-3.5 py-1.5 bevel-button uppercase tracking-[0.5px] cursor-pointer shadow-md"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#21242e] text-[#ecab37] flex items-center justify-center text-[10px] font-black bevel-button">
                      ▶
                    </span>
                    <span>마이링크 허브 (링크 목록 열기)</span>
                  </Link>

                  <a
                    href="https://github.com/young7297"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#21242e] hover:bg-[#3d4f97] text-white text-xs font-bold px-3 py-1.5 bevel-button uppercase tracking-[0.5px] cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#f68d1f] text-white flex items-center justify-center text-[10px] bevel-button">
                      ▶
                    </span>
                    <span>깃허브 저장소 방문</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="bg-[#ecab37] hover:bg-[#e48600] text-[#21242e] text-xs font-bold px-3 py-1.5 rounded-[2px] bevel-button uppercase tracking-[0.5px] cursor-pointer"
                  >
                    개발자 문의 ✉
                  </button>
                </div>
              </div>

              {/* 우측 하드웨어 그래픽 */}
              <div className="relative z-10 shrink-0">
                <Image
                  src="/console-hardware.svg"
                  alt="2001 콘솔 하드웨어"
                  width={340}
                  height={200}
                  priority
                  className="w-[280px] sm:w-[320px] h-auto drop-shadow-md select-none"
                />
              </div>
            </section>


            {/* ------------------------------------------------------- */}
            {/* 2열 그리드: 2/3 콘텐츠 + 1/3 우측 액션 레일             */}
            {/* ------------------------------------------------------- */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* 좌측 열: ~2/3 (공식 소식, 프로젝트 모음, 투표) */}
              <div className="md:col-span-2 flex flex-col gap-3">
                
                {/* 1. 공식 소식 & 주요 업데이트 */}
                <div id="news" className="w-full bg-[#7a8aba] bevel-plate p-1">
                  <div className="bg-[#7a8aba] px-2 py-1 flex items-center justify-between border-b border-[#3d4f97]">
                    <span className="chrome-label text-[#21242e] flex items-center gap-1.5">
                      <span>≡</span>
                      <span>공식 소식 &amp; 주요 업데이트</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#3d4f97]">
                      아카이브 / 2001-2026
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    
                    {/* 소식 1 */}
                    <div className="bg-[#dedede] inset-plate-subtle p-2 flex items-center justify-between gap-2 hover:bg-white transition-colors group">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[2px]">
                          주목
                        </span>
                        <div>
                          <a
                            href="https://github.com/young7297"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#3d4f97] group-hover:underline line-clamp-1"
                          >
                            인터랙티브 2001 웹 콘솔 에디션 깃허브 공개
                          </a>
                          <p className="text-[10px] text-[#21242e]/70">
                            2026년 6월 1일 — 2001년 닌텐도 하드웨어 감성을 Next.js와 Tailwind로 재현
                          </p>
                        </div>
                      </div>
                      <a
                        href="https://github.com/young7297"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-[18px] h-[18px] bg-[#f68d1f] hover:bg-[#e48600] rounded-[2px] text-white flex items-center justify-center text-[9px] font-black shrink-0 bevel-button"
                      >
                        ▶
                      </a>
                    </div>

                    {/* 소식 2 */}
                    <div className="bg-[#dedede] inset-plate-subtle p-2 flex items-center justify-between gap-2 hover:bg-white transition-colors group">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#206479] text-white text-[9px] font-black px-1.5 py-0.5 rounded-[2px]">
                          기술
                        </span>
                        <div>
                          <span className="text-xs font-bold text-[#3d4f97] group-hover:underline line-clamp-1 cursor-pointer">
                            모던 기술 스택: React 19 + TypeScript + Tailwind v4
                          </span>
                          <p className="text-[10px] text-[#21242e]/70">
                            2026년 5월 28일 — 런타임 오버헤드 최소화, 정적 내보내기 및 반응형 지원
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => showToast("시스템 스택: React 19 / Tailwind 4")}
                        className="w-[18px] h-[18px] bg-[#f68d1f] hover:bg-[#e48600] rounded-[2px] text-white flex items-center justify-center text-[9px] font-black shrink-0 bevel-button cursor-pointer"
                      >
                        ▶
                      </button>
                    </div>

                    {/* 소식 3 */}
                    <div className="bg-[#dedede] inset-plate-subtle p-2 flex items-center justify-between gap-2 hover:bg-white transition-colors group">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#ecab37] text-[#21242e] text-[9px] font-black px-1.5 py-0.5 rounded-[2px]">
                          개발
                        </span>
                        <div>
                          <span className="text-xs font-bold text-[#3d4f97] group-hover:underline line-clamp-1 cursor-pointer">
                            주니어 프론트엔드 개발자: 언제나 새로운 협업을 환영합니다
                          </span>
                          <p className="text-[10px] text-[#21242e]/70">
                            2026년 5월 15일 — 사용자 중심의 가치 있는 웹 서비스를 함께 만들 준비가 되었습니다
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="w-[18px] h-[18px] bg-[#f68d1f] hover:bg-[#e48600] rounded-[2px] text-white flex items-center justify-center text-[9px] font-black shrink-0 bevel-button cursor-pointer"
                      >
                        ▶
                      </button>
                    </div>

                  </div>
                </div>

                {/* 2. 주요 사이트 & 프로젝트 모음 (2x2 Grid) */}
                <div id="projects" className="w-full bg-[#7a8aba] bevel-plate p-1">
                  <div className="bg-[#7a8aba] px-2 py-1 flex items-center justify-between border-b border-[#3d4f97]">
                    <span className="chrome-label text-[#21242e] flex items-center gap-1.5">
                      <span>≡</span>
                      <span>주요 사이트 &amp; 프로젝트 모음</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#3d4f97]">
                      2×2 네트워크 그리드
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    
                    {/* 타일 1: GitHub */}
                    <a
                      href="https://github.com/young7297"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="carbon-halftone border border-[#3d4f97] p-2 flex flex-col justify-between hover:bg-[#3d4f97] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#ecab37] uppercase group-hover:text-white">
                          깃허브 저장소
                        </span>
                        <span className="text-[9px] bg-[#e60012] text-white px-1 rounded-[2px]">
                          VCS
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">
                        @young7297
                      </p>
                      <span className="text-[9px] font-mono text-[#9fbee7]">
                        github.com/young7297
                      </span>
                    </a>

                    {/* 타일 2: MyLink */}
                    <Link
                      href="/dayoung"
                      className="carbon-halftone border border-[#3d4f97] p-2 flex flex-col justify-between hover:bg-[#3d4f97] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#ecab37] uppercase group-hover:text-white">
                          마이링크 프로젝트
                        </span>
                        <span className="text-[9px] bg-[#f68d1f] text-white px-1 rounded-[2px]">
                          WEB
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">
                        개발자 링크 허브 콘솔
                      </p>
                      <span className="text-[9px] font-mono text-[#9fbee7]">
                        mylink.kr/dayoung
                      </span>
                    </Link>

                    {/* 타일 3: Tech Blog */}
                    <a
                      href="https://velog.io/@young7297"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="carbon-halftone border border-[#3d4f97] p-2 flex flex-col justify-between hover:bg-[#3d4f97] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#ecab37] uppercase group-hover:text-white">
                          기술 개발 블로그
                        </span>
                        <span className="text-[9px] bg-[#206479] text-white px-1 rounded-[2px]">
                          기록
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">
                        개발 노트 &amp; 트러블슈팅
                      </p>
                      <span className="text-[9px] font-mono text-[#9fbee7]">
                        velog.io/@young7297
                      </span>
                    </a>

                    {/* 타일 4: Nintendo 2001 */}
                    <div
                      onClick={() => showToast("2001 콘솔 하드웨어 크롬이 적용되었습니다!")}
                      className="carbon-halftone border border-[#3d4f97] p-2 flex flex-col justify-between hover:bg-[#3d4f97] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#ecab37] uppercase group-hover:text-white">
                          2001 웹 콘솔
                        </span>
                        <span className="text-[9px] bg-[#a7282b] text-white px-1 rounded-[2px]">
                          디자인
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white mb-1">
                        페리윙클 하드웨어 머신
                      </p>
                      <span className="text-[9px] font-mono text-[#9fbee7]">
                        닌텐도 2001 하드웨어 감성
                      </span>
                    </div>

                  </div>
                </div>

                {/* 3. 플레이어 투표 모듈 */}
                <div className="w-full bg-[#8ba1d4] bevel-plate p-3 rounded-[6px]">
                  <div className="flex items-center justify-between border-b border-[#3d4f97] pb-1.5 mb-2">
                    <span className="chrome-label text-[#21242e] flex items-center gap-1.5">
                      <span>★</span>
                      <span>금주의 개발자 투표</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#3d4f97]">
                      질문 #2001
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#21242e] mb-2.5">
                    현대 웹 애플리케이션 개발에서 가장 중요하게 생각하는 프론트엔드 역량은?
                  </p>

                  <form onSubmit={handlePollSubmit} className="space-y-1.5">
                    {[
                      { id: "1", label: "손끝으로 느껴지는 촉각적 UI 피드백과 지연 없는 반응성" },
                      { id: "2", label: "모듈화되고 깔끔하며 유지보수하기 쉬운 컴포넌트 아키텍처" },
                      { id: "3", label: "모바일과 데스크톱 어디서나 정밀한 픽셀 퍼펙트 반응형 레이아웃" },
                      { id: "4", label: "신뢰할 수 있는 성능 최적화, 빠른 로딩 및 웹 접근성 준수" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 text-xs text-[#21242e] font-medium cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="playersPoll"
                          value={opt.id}
                          checked={pollSelection === opt.id}
                          onChange={(e) => setPollSelection(e.target.value)}
                          className="w-3.5 h-3.5 accent-[#f68d1f] cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="submit"
                        className="bg-[#f68d1f] hover:bg-[#e48600] active:bg-[#e60012] text-white text-xs font-bold px-4 py-1.5 rounded-[2px] bevel-button uppercase tracking-[0.5px] cursor-pointer"
                      >
                        {pollVoted ? "투표 완료 ✓" : "투표하기"}
                      </button>

                      <span className="text-[10px] font-bold text-[#3d4f97]">
                        총 투표수: 2,001표
                      </span>
                    </div>
                  </form>
                </div>

              </div>


              {/* 우측 액션 레일: ~1/3 (커맨드 버튼, 소개 박스, 프로모, 캘린더) */}
              <div className="flex flex-col gap-3">
                
                {/* 1. 카본 커맨드 액션 버튼 */}
                <div className="flex flex-col gap-1.5">
                  <Link
                    href="/dayoung"
                    className="bg-[#f68d1f] hover:bg-[#e48600] text-white border border-white/40 px-3 py-2 text-left flex items-center justify-between bevel-button group cursor-pointer shadow-md"
                  >
                    <span className="chrome-label text-white group-hover:text-[#21242e] font-black">
                      [▶] 마이링크 허브 (링크 목록)
                    </span>
                    <span className="text-white text-xs font-black">▶</span>
                  </Link>

                  <a
                    href="https://github.com/young7297"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="carbon-halftone text-white border border-[#3d4f97] px-3 py-2 text-left flex items-center justify-between hover:bg-[#3d4f97] bevel-button group cursor-pointer"
                  >
                    <span className="chrome-label text-white group-hover:text-[#ecab37]">
                      [★] 깃허브 저장소 바로가기
                    </span>
                    <span className="text-[#f68d1f] text-xs">▶</span>
                  </a>

                  <a
                    href="mailto:ydo9902@gmail.com"
                    className="carbon-halftone text-white border border-[#3d4f97] px-3 py-2 text-left flex items-center justify-between hover:bg-[#3d4f97] bevel-button group cursor-pointer"
                  >
                    <span className="chrome-label text-white group-hover:text-[#ecab37]">
                      [✉] 이메일 보내기
                    </span>
                    <span className="text-[#f68d1f] text-xs">▶</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="carbon-halftone text-white border border-[#3d4f97] px-3 py-2 text-left flex items-center justify-between hover:bg-[#3d4f97] bevel-button group cursor-pointer"
                  >
                    <span className="chrome-label text-white group-hover:text-[#ecab37]">
                      [📋] 이메일 주소 복사
                    </span>
                    <span className="text-[#f68d1f] text-xs">▶</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="carbon-halftone text-white border border-[#3d4f97] px-3 py-2 text-left flex items-center justify-between hover:bg-[#3d4f97] bevel-button group cursor-pointer"
                  >
                    <span className="chrome-label text-white group-hover:text-[#ecab37]">
                      [🔗] 프로필 주소 공유
                    </span>
                    <span className="text-[#f68d1f] text-xs">▶</span>
                  </button>
                </div>

                {/* 2. 개발자 소개 인포 박스 */}
                <div className="bg-white bevel-plate p-3 text-left">
                  <div className="bg-[#ecab37] border-b border-[#3d4f97] -mx-3 -mt-3 px-3 py-1 mb-2.5">
                    <span className="chrome-label text-[#21242e]">
                      개발자 소개 — 윤다영
                    </span>
                  </div>

                  <p className="text-xs text-[#21242e] leading-relaxed mb-2 font-normal">
                    직관적인 UI와 더 나은 사용자 경험을 고민하는 주니어 개발자 윤다영입니다. 배움을 즐기며 코드 한 줄로 의미 있는 가치를 만듭니다.
                  </p>

                  <div className="dotted-divider my-2" />

                  <div className="text-[10px] font-bold text-[#3d4f97] space-y-0.5">
                    <p>• 거주지: 대한민국 서울</p>
                    <p>• 직무: 주니어 프론트엔드 개발자</p>
                    <p>• 구직 상태: 협업 및 채용 열려있음</p>
                  </div>
                </div>

                {/* 3. 사이드 프로모 카드: 포트폴리오 어드밴스 */}
                <div className="bg-[#acace7] bevel-plate p-3 text-left">
                  <div className="flex items-center justify-between border-b border-[#3d4f97] pb-1 mb-2">
                    <span className="text-[11px] font-bold text-[#21242e] uppercase">
                      포트폴리오 어드밴스
                    </span>
                    <button
                      type="button"
                      onClick={() => setAvatarView((prev) => (prev === "mario" ? "photo" : "mario"))}
                      className="text-[9px] font-bold bg-[#ecab37] text-[#21242e] px-1.5 py-0.5 rounded-[2px] bevel-button cursor-pointer uppercase"
                    >
                      전환 🔁
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-14 h-14 bg-white border-2 border-[#3d4f97] overflow-hidden rounded-[4px] shrink-0">
                      <Image
                        src={avatarView === "mario" ? "/avatar-neo.svg" : "/profile.png"}
                        alt="프로필 아바타"
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#21242e]">
                        윤다영 (Dayoung)
                      </p>
                      <p className="text-[10px] text-[#3d4f97]">
                        하드웨어 크롬 에디션
                      </p>
                      <span className="text-[9px] bg-[#f68d1f] text-white px-1 rounded-[1px] font-bold">
                        VER 2001
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#21242e] leading-snug">
                    사소한 인터랙션과 코드 가독성까지 꼼꼼히 챙기는 집요한 개발자입니다.
                  </p>
                </div>

                {/* 4. 캘린더 위젯 */}
                <div className="bg-white bevel-plate p-2.5 text-center">
                  <div className="carbon-halftone text-white px-2 py-1 text-center font-bold text-[11px] mb-2 border border-[#3d4f97] flex items-center justify-between">
                    <span>2026년 6월</span>
                    <span className="text-[#ecab37]">01일</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-[10px] text-[#21242e] font-bold mb-1">
                    <span className="text-[#e60012]">일</span>
                    <span>월</span>
                    <span>화</span>
                    <span>수</span>
                    <span>목</span>
                    <span>금</span>
                    <span className="text-[#3d4f97]">토</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-[10px] text-[#21242e]">
                    <span className="text-gray-300">31</span>
                    <span className="bg-[#f68d1f] text-white font-bold rounded-[2px]">01</span>
                    <span>02</span>
                    <span>03</span>
                    <span>04</span>
                    <span>05</span>
                    <span>06</span>
                    <span>07</span>
                    <span>08</span>
                    <span>09</span>
                    <span className="bg-[#ecab37] font-bold rounded-[2px]">10</span>
                    <span>11</span>
                    <span>12</span>
                    <span>13</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ========================================================= */}
        {/* 3. 푸터 바: ESRB 인증 및 카피라이트 카본 슬래브          */}
        {/* ========================================================= */}
        <footer className="carbon-halftone border-t border-[#3d4f97] p-3 sm:p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
          
          {/* ESRB 인증 뱃지 */}
          <div className="flex items-center gap-2">
            <Image
              src="/esrb-badge.svg"
              alt="ESRB 인증 뱃지"
              width={130}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          {/* 카피라이트 안내 */}
          <div className="text-center sm:text-right micro-label text-[#9fbee7] space-y-0.5">
            <p>
              © 1997–2001 Nintendo of America Inc. / © 2026 윤다영 (Dayoung Yoon). All rights reserved.
            </p>
            <p className="text-[9px] text-[#7a8aba]">
              Nintendo 64, Game Boy Advance, and console trademarks are properties of Nintendo.
            </p>
            <div className="flex items-center justify-center sm:justify-end gap-2 text-[10px] text-[#ecab37] font-bold pt-1">
              <a href="#privacy" className="hover:underline">개인정보처리방침</a>
              <span>•</span>
              <a href="#terms" className="hover:underline">이용약관</a>
              <span>•</span>
              <a href="mailto:ydo9902@gmail.com" className="hover:underline">개발자 문의</a>
            </div>
          </div>
        </footer>

      </div>

      {/* Retro Console Toast */}
      <Toast
        isVisible={isToastVisible}
        message={toastMessage}
        onClose={() => setIsToastVisible(false)}
      />
    </main>
  );
}
