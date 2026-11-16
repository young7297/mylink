import { LinkItem } from "@/types/link";

export const AVAILABLE_ICONS = [
  { id: "link", label: "기본 링크" },
  { id: "instagram", label: "Instagram" },
  { id: "github", label: "GitHub" },
  { id: "blog", label: "블로그" },
  { id: "file-text", label: "이력서/노션" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "figma", label: "Figma" },
  { id: "globe", label: "웹사이트" },
  { id: "message-circle", label: "카카오톡" },
  { id: "mail", label: "이메일" },
  { id: "gamepad", label: "프로젝트" },
  { id: "codes", label: "저장소" },
] as const;

export const CATEGORY_SELECT_OPTIONS = [
  { value: "projects", label: "프로젝트" },
  { value: "skills", label: "기술스택" },
  { value: "codes", label: "저장소" },
  { value: "social", label: "소셜" },
  { value: "contact", label: "연락처" },
] as const;

/**
 * URL 표준화 헬퍼 (중복 검사용)
 */
export function normalizeUrl(urlStr: string): string {
  try {
    const trimmed = urlStr.trim().toLowerCase();
    if (trimmed.startsWith("mailto:")) {
      return trimmed;
    }
    const full = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const u = new URL(full);
    return (u.hostname + u.pathname.replace(/\/$/, "")).toLowerCase();
  } catch {
    return urlStr.trim().toLowerCase();
  }
}

/**
 * 1. 제목 유효성 검증 함수 (추가/수정 공통)
 */
export function validateTitleField(val: string): string | undefined {
  const trimmed = val.trim();
  if (!trimmed) {
    return "링크 제목을 입력해 주세요.";
  }
  if (trimmed.length < 2) {
    return "링크 제목은 최소 2자 이상 입력해 주세요.";
  }
  if (val.length > 50) {
    return "링크 제목은 최대 50자까지 입력 가능해요.";
  }
  return undefined;
}

/**
 * 2. URL 유효성 검증 함수 (추가/수정 공통)
 * @param val 입력된 URL 문자열
 * @param existingLinks 기존 등록된 링크 목록 (중복 체크용)
 * @param currentLinkId 수정 중인 링크 ID (수정 시 자기 자신은 중복 체크에서 제외)
 */
export function validateUrlField(
  val: string,
  existingLinks: LinkItem[] = [],
  currentLinkId?: string
): { error?: string; formattedUrl: string } {
  const trimmed = val.trim();
  if (!trimmed) {
    return { error: "링크 주소(URL)를 입력해 주세요.", formattedUrl: "" };
  }

  if (trimmed.length > 500) {
    return { error: "링크 주소가 너무 길어요 (최대 500자).", formattedUrl: trimmed };
  }

  // mailto: 스킴 지원
  if (trimmed.toLowerCase().startsWith("mailto:")) {
    const email = trimmed.replace(/^mailto:/i, "").trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return {
        error: "올바른 이메일 주소 형식(예: mailto:name@example.com)을 입력해 주세요.",
        formattedUrl: trimmed,
      };
    }
    return { formattedUrl: `mailto:${email}` };
  }

  // 일반 웹 주소 프로토콜 보정
  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        error: "http 또는 https 형식의 올바른 웹 주소를 입력해 주세요.",
        formattedUrl: formatted,
      };
    }

    const hostname = parsed.hostname;
    if (!hostname || hostname.length < 3) {
      return {
        error: "올바른 도메인 주소(예: https://example.com)를 입력해 주세요.",
        formattedUrl: formatted,
      };
    }

    // 점(.) 포함 여부 또는 localhost 허용
    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
    const hasValidDomain = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(hostname);
    if (!isLocalhost && !hasValidDomain) {
      return {
        error: "올바른 도메인 주소(예: velog.io, github.com)를 입력해 주세요.",
        formattedUrl: formatted,
      };
    }

    // 중복 링크 확인 (수정 대상인 자기 자신 제외)
    const normalizedCurrent = normalizeUrl(formatted);
    const isDuplicate = existingLinks.some(
      (l) => l.id !== currentLinkId && normalizeUrl(l.url) === normalizedCurrent
    );
    if (isDuplicate) {
      return {
        error: "이미 목록에 등록되어 있는 링크 주소예요.",
        formattedUrl: formatted,
      };
    }

    return { formattedUrl: formatted };
  } catch {
    return {
      error: "올바른 URL 형식(예: https://example.com)을 입력해 주세요.",
      formattedUrl: formatted,
    };
  }
}

/**
 * 3. 설명 유효성 검증 함수 (추가/수정 공통)
 */
export function validateDescriptionField(val: string): string | undefined {
  if (val.length > 100) {
    return "설명은 최대 100자까지 입력 가능해요.";
  }
  return undefined;
}
