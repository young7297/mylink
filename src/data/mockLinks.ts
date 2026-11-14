import { LinkItem, MyLinkData } from "@/types/link";

/**
 * 기본 링크 목록 더미 데이터
 * (LinkItem 인터페이스 준수 및 카테고리/아이콘/활성화 상태 포함)
 */
export const DUMMY_LINKS: LinkItem[] = [
  {
    id: "link-01",
    title: "GitHub 포트폴리오 & 코드 저장소",
    url: "https://github.com/young7297",
    description: "진행 중인 오픈소스 프로젝트와 개인 토이 프로젝트 코드 아카이브",
    category: "codes",
    icon: "github",
    active: true,
    order: 0,
    createdAt: "2026-11-01T09:00:00Z",
  },
  {
    id: "link-02",
    title: "마이링크 2001 콘솔 에디션",
    url: "https://young7297.github.io/mylink",
    description: "Next.js 16 & Tailwind CSS v4 기반 Y2K 콘솔 하드웨어 감성의 링크 허브 웹앱",
    category: "projects",
    icon: "gamepad",
    active: true,
    order: 1,
    createdAt: "2026-11-03T14:30:00Z",
  },
  {
    id: "link-03",
    title: "기술 개발 블로그 & 트러블슈팅",
    url: "https://velog.io/@young7297",
    description: "React 19 비동기 최적화 및 모던 프론트엔드 아키텍처 학습 기록 블로그",
    category: "skills",
    icon: "book-open",
    active: true,
    order: 2,
    createdAt: "2026-11-05T11:20:00Z",
  },
  {
    id: "link-04",
    title: "인터랙티브 웹 이력서 (노션)",
    url: "https://notion.so/dayoung-resume",
    description: "상세 이력서, 기술 스택 명세서, 업무 역량 및 프로젝트 회고 문서",
    category: "projects",
    icon: "file-text",
    active: true,
    order: 3,
    createdAt: "2026-11-08T18:00:00Z",
  },
  {
    id: "link-05",
    title: "링크드인 커리어 프로필",
    url: "https://www.linkedin.com/in/dayoung-yoon",
    description: "글로벌 네트워크 및 프론트엔드 커리어 이력 연결",
    category: "social",
    icon: "linkedin",
    active: true,
    order: 4,
    createdAt: "2026-11-10T10:15:00Z",
  },
  {
    id: "link-06",
    title: "디자인 시스템 & 피그마 키트",
    url: "https://figma.com/@dayoung-console-ui",
    description: "2001 하드웨어 챔퍼드 베벨 디자인 토큰 및 UI 컴포넌트 라이브러리",
    category: "skills",
    icon: "figma",
    active: true,
    order: 5,
    createdAt: "2026-11-12T16:40:00Z",
  },
  {
    id: "link-07",
    title: "이메일 협업 및 채용 문의 (Gmail)",
    url: "mailto:ydo9902@gmail.com",
    description: "프로젝트 협업, 채용 문의 및 커피챗 다이렉트 메일",
    category: "contact",
    icon: "mail",
    active: true,
    order: 6,
    createdAt: "2026-11-13T12:00:00Z",
  },
  {
    id: "link-08",
    title: "카카오톡 오픈채팅 (1:1 빠른 대화)",
    url: "https://open.kakao.com/me/dayoung-dev",
    description: "실시간 빠른 문의 및 소통 채널 (비활성화 테스트 항목)",
    category: "contact",
    icon: "message-circle",
    active: false,
    order: 7,
    createdAt: "2026-11-14T08:20:00Z",
  },
];

/**
 * 카테고리 필터 목록 (한국어)
 */
export const CATEGORY_OPTIONS = [
  { value: "all", label: "전체 카테고리" },
  { value: "projects", label: "프로젝트" },
  { value: "skills", label: "기술 스택" },
  { value: "codes", label: "코드 저장소" },
  { value: "social", label: "소셜 링크" },
  { value: "contact", label: "문의 및 연락처" },
] as const;

/**
 * PRD v1.3 localStorage('mylink_data') 전체 스키마 더미 데이터
 * 페르소나: 윤다영 (Frontend Developer)
 */
export const MOCK_MYLINK_DATA: MyLinkData = {
  slug: "dayoung",
  profile: {
    name: "윤다영 (Dayoung Yoon)",
    bio: "화려한 비주얼과 손끝에 전해지는 촉각적 피드백, 직관적인 사용자 경험을 현대적인 웹으로 설계합니다.",
    jobTitle: "주니어 프론트엔드 개발자",
    location: "대한민국 서울",
    avatarUrl: "/mario-welcome.svg",
  },
  theme: {
    preset: "periwinkle-chrome",
    bgColor: "#556288",
    bevelStyle: "sharp-chamfer",
    accentColor: "#f68d1f",
  },
  socials: {
    github: "https://github.com/young7297",
    blog: "https://velog.io/@young7297",
    linkedin: "https://www.linkedin.com/in/dayoung-yoon",
    email: "ydo9902@gmail.com",
  },
  links: DUMMY_LINKS,
};

/**
 * 디자이너 페르소나 더미 데이터 (PRD 시나리오 A - 김지수)
 */
export const MOCK_DESIGNER_DATA: MyLinkData = {
  slug: "jisoo-design",
  profile: {
    name: "김지수 (Jisoo Kim)",
    bio: "프리랜서 UI/UX 디자이너 🎨 직관적이고 감각적인 디지털 경험을 설계합니다.",
    jobTitle: "프로덕트 디자이너",
    location: "대한민국 서울",
  },
  theme: {
    preset: "lavender-soft",
    bgColor: "#60619c",
    bevelStyle: "smooth-bevel",
    accentColor: "#ecab37",
  },
  socials: {
    instagram: "https://instagram.com/jisoo_design",
    email: "jisoo.design@example.com",
  },
  links: [
    {
      id: "design-01",
      title: "노션 포트폴리오 2026",
      url: "https://notion.so/jisoo-portfolio",
      description: "주요 클라이언트 프로젝트 및 디자인 케이스 스터디",
      category: "projects",
      icon: "file-text",
      active: true,
      order: 0,
      createdAt: "2026-11-10T10:00:00Z",
    },
    {
      id: "design-02",
      title: "비핸스 디자인 아카이브",
      url: "https://behance.net/jisoo_design",
      description: "그래픽, 브랜딩 및 모바일 앱 UI 목업 아카이브",
      category: "projects",
      icon: "image",
      active: true,
      order: 1,
      createdAt: "2026-11-11T12:00:00Z",
    },
    {
      id: "design-03",
      title: "인스타그램 디자인 작업 일지",
      url: "https://instagram.com/jisoo_design",
      description: "일상 디자인 스케치 및 팁 공유",
      category: "social",
      icon: "instagram",
      active: true,
      order: 2,
      createdAt: "2026-11-12T15:00:00Z",
    },
    {
      id: "design-04",
      title: "외주 및 디자인 상담 (카카오톡)",
      url: "https://open.kakao.com/me/jisoodesign",
      description: "프로젝트 견적 및 일정 문의",
      category: "contact",
      icon: "message-circle",
      active: true,
      order: 3,
      createdAt: "2026-11-14T09:00:00Z",
    },
  ],
};
