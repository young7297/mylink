"use client";

import React, { useState, useEffect, useRef } from "react";
import { LinkItem } from "@/types/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  getLinkIcon,
  getCategoryBadgeStyle,
  ChevronRight,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";

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

export interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLink: (link: Omit<LinkItem, "id" | "order" | "createdAt">) => void;
  existingLinks?: LinkItem[];
}

/**
 * URL 표준화 헬퍼 (중복 검사용)
 */
function normalizeUrl(urlStr: string): string {
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

export default function AddLinkDialog({
  open,
  onOpenChange,
  onAddLink,
  existingLinks = [],
}: AddLinkDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("projects");
  const [icon, setIcon] = useState<string>("link");
  const [active, setActive] = useState<boolean>(true);

  // 유효성 검사 에러 상태
  const [errors, setErrors] = useState<{
    title?: string;
    url?: string;
    description?: string;
  }>({});

  // 사용자가 해당 필드를 건드렸는지 여부 (onBlur 시 검사)
  const [touched, setTouched] = useState<{
    title?: boolean;
    url?: boolean;
    description?: boolean;
  }>({});

  // 수동 선택 여부 (URL 자동 감지가 덮어쓰지 않도록 추적)
  const [isManualIcon, setIsManualIcon] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);

  // 인풋 엘리먼트 참조 (포커스 이동용)
  const titleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // 다이얼로그 열릴 때 폼 초기화
  useEffect(() => {
    if (open) {
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("projects");
      setIcon("link");
      setActive(true);
      setErrors({});
      setTouched({});
      setIsManualIcon(false);
      setIsManualCategory(false);
    }
  }, [open]);

  // 1. 제목 유효성 검증 함수
  const validateTitleField = (val: string): string | undefined => {
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
  };

  // 2. URL 유효성 검증 함수
  const validateUrlField = (val: string): { error?: string; formattedUrl: string } => {
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

      // 중복 링크 확인
      const normalizedCurrent = normalizeUrl(formatted);
      const isDuplicate = existingLinks.some(
        (l) => normalizeUrl(l.url) === normalizedCurrent
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
  };

  // 3. 설명 유효성 검증 함수
  const validateDescriptionField = (val: string): string | undefined => {
    if (val.length > 100) {
      return "설명은 최대 100자까지 입력 가능해요.";
    }
    return undefined;
  };

  // 제목 변경 핸들러
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (touched.title) {
      setErrors((prev) => ({ ...prev, title: validateTitleField(val) }));
    }
  };

  // URL 입력 시 스마트 자동 감지 및 실시간 검증
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (touched.url) {
      const { error } = validateUrlField(value);
      setErrors((prev) => ({ ...prev, url: error }));
    }

    const lower = value.toLowerCase().trim();
    if (!isManualIcon) {
      if (lower.includes("instagram.com")) {
        setIcon("instagram");
        if (!isManualCategory) setCategory("social");
      } else if (lower.includes("github.com")) {
        setIcon("github");
        if (!isManualCategory) setCategory("codes");
      } else if (lower.includes("linkedin.com")) {
        setIcon("linkedin");
        if (!isManualCategory) setCategory("social");
      } else if (lower.includes("figma.com")) {
        setIcon("figma");
        if (!isManualCategory) setCategory("skills");
      } else if (
        lower.includes("velog.io") ||
        lower.includes("blog.") ||
        lower.includes("tistory.com")
      ) {
        setIcon("blog");
        if (!isManualCategory) setCategory("skills");
      } else if (
        lower.includes("notion.so") ||
        lower.includes("notion.site")
      ) {
        setIcon("file-text");
        if (!isManualCategory) setCategory("projects");
      } else if (lower.startsWith("mailto:")) {
        setIcon("mail");
        if (!isManualCategory) setCategory("contact");
      } else if (
        lower.includes("kakao.com") ||
        lower.includes("open.kakao")
      ) {
        setIcon("message-circle");
        if (!isManualCategory) setCategory("contact");
      }
    }
  };

  // 설명 변경 핸들러
  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (touched.description) {
      setErrors((prev) => ({ ...prev, description: validateDescriptionField(val) }));
    }
  };

  // 블러(Blur) 핸들러
  const handleBlur = (field: "title" | "url" | "description") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "title") {
      setErrors((prev) => ({ ...prev, title: validateTitleField(title) }));
    } else if (field === "url") {
      const { error } = validateUrlField(url);
      setErrors((prev) => ({ ...prev, url: error }));
    } else if (field === "description") {
      setErrors((prev) => ({ ...prev, description: validateDescriptionField(description) }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드를 touched 처리
    setTouched({ title: true, url: true, description: true });

    const titleErr = validateTitleField(title);
    const { error: urlErr, formattedUrl } = validateUrlField(url);
    const descErr = validateDescriptionField(description);

    setErrors({
      title: titleErr,
      url: urlErr,
      description: descErr,
    });

    if (titleErr) {
      titleInputRef.current?.focus();
      return;
    }

    if (urlErr) {
      urlInputRef.current?.focus();
      return;
    }

    if (descErr) {
      return;
    }

    onAddLink({
      title: title.trim(),
      url: formattedUrl,
      description: description.trim() || undefined,
      category,
      icon,
      active,
    });

    onOpenChange(false);
  };

  // 실시간 미리보기용 호스트 주소 가공
  const previewHost = (() => {
    if (!url.trim()) return "link-preview.com";
    try {
      if (url.startsWith("mailto:")) return url.replace("mailto:", "");
      const full = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      const u = new URL(full);
      return u.hostname + (u.pathname !== "/" ? u.pathname : "");
    } catch {
      return url;
    }
  })();

  const badgeStyle = getCategoryBadgeStyle(category);

  // 유효 상태 플래그 (녹색 체크마크 표시용)
  const isTitleValid = touched.title && !errors.title && title.trim().length >= 2;
  const isUrlValid = touched.url && !errors.url && url.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#3182f6] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              +
            </span>
            <DialogTitle>새 링크 추가하기</DialogTitle>
          </div>
          <DialogDescription>
            내 프로필에 노출될 새로운 링크 정보를 입력해 주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
          {/* 1. 링크 제목 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="link-title"
                className="text-[13px] font-semibold text-[#191f28] flex items-center gap-1"
              >
                링크 제목 <span className="text-[#f04452]">*</span>
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  title.length > 50 ? "text-[#f04452] font-semibold" : "text-[#8b95a1]"
                }`}
              >
                {title.length}/50자
              </span>
            </div>

            <div className="relative flex items-center">
              <Input
                id="link-title"
                ref={titleInputRef}
                type="text"
                maxLength={60}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="예: 내 인스타그램, GitHub 포트폴리오"
                className={
                  touched.title && errors.title
                    ? "border-[#f04452] focus:border-[#f04452] focus:ring-[#f04452]/15 pr-9"
                    : isTitleValid
                    ? "border-[#00b569]/60 focus:border-[#00b569] focus:ring-[#00b569]/15 pr-9"
                    : ""
                }
                autoFocus
              />
              {isTitleValid && (
                <CheckCircle2 className="absolute right-3 w-4 h-4 text-[#00b569] pointer-events-none" />
              )}
            </div>

            {touched.title && errors.title ? (
              <p className="text-[12px] text-[#f04452] font-medium flex items-center gap-1 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title}</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#8b95a1] pl-0.5">
                링크 목록에 굵게 표시될 이름이에요 (2~50자)
              </p>
            )}
          </div>

          {/* 2. 대상 URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="link-url"
                className="text-[13px] font-semibold text-[#191f28] flex items-center gap-1"
              >
                링크 주소 (URL) <span className="text-[#f04452]">*</span>
              </label>
              <span className="text-[11px] text-[#8b95a1] font-normal">
                자동 아이콘 감지 지원
              </span>
            </div>

            <div className="relative flex items-center">
              <Input
                id="link-url"
                ref={urlInputRef}
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={() => handleBlur("url")}
                placeholder="예: https://instagram.com/my_id"
                className={
                  touched.url && errors.url
                    ? "border-[#f04452] focus:border-[#f04452] focus:ring-[#f04452]/15 pr-9"
                    : isUrlValid
                    ? "border-[#00b569]/60 focus:border-[#00b569] focus:ring-[#00b569]/15 pr-9"
                    : ""
                }
              />
              {isUrlValid && (
                <CheckCircle2 className="absolute right-3 w-4 h-4 text-[#00b569] pointer-events-none" />
              )}
            </div>

            {touched.url && errors.url ? (
              <p className="text-[12px] text-[#f04452] font-medium flex items-center gap-1 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.url}</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#8b95a1] pl-0.5">
                https:// 도메인을 포함하거나, 주소만 적어도 자동으로 완성돼요
              </p>
            )}
          </div>

          {/* 3. 카테고리 선택 */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-[#191f28]">
              카테고리
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORY_SELECT_OPTIONS.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setCategory(cat.value);
                      setIsManualCategory(true);
                    }}
                    className={`h-8 px-3 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#191f28] text-white shadow-sm ring-1 ring-[#191f28]"
                        : "bg-white text-[#4e5968] border border-[#e5e8eb] hover:bg-[#f2f4f6]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. 아이콘 선택 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#191f28]">
                아이콘 선택
              </label>
              <span className="text-[11px] text-[#8b95a1]">
                현재: <strong className="text-[#3182f6]">{icon}</strong>
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[120px] overflow-y-auto p-1.5 bg-[#f2f4f6]/60 rounded-xl border border-[#e5e8eb]/70">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = icon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIcon(item.id);
                      setIsManualIcon(true);
                    }}
                    title={item.label}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-white text-[#3182f6] shadow-sm ring-1.5 ring-[#3182f6]"
                        : "bg-transparent text-[#6b7684] hover:bg-white hover:text-[#191f28]"
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      {getLinkIcon(item.id, "w-4 h-4")}
                    </div>
                    <span className="text-[10px] mt-1 truncate max-w-full font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. 설명 입력 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="link-desc"
                className="text-[13px] font-semibold text-[#191f28]"
              >
                설명{" "}
                <span className="text-[11px] text-[#8b95a1] font-normal">
                  (선택)
                </span>
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  description.length > 100
                    ? "text-[#f04452] font-semibold"
                    : "text-[#8b95a1]"
                }`}
              >
                {description.length}/100자
              </span>
            </div>
            <Input
              id="link-desc"
              type="text"
              maxLength={110}
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => handleBlur("description")}
              placeholder="예: 프로젝트 회고와 개발 일상을 기록해요"
              className={
                touched.description && errors.description
                  ? "border-[#f04452] focus:border-[#f04452] focus:ring-[#f04452]/15"
                  : ""
              }
            />
            {touched.description && errors.description && (
              <p className="text-[12px] text-[#f04452] font-medium flex items-center gap-1 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* 6. 활성화 상태 토글 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f2f4f6]/70 border border-[#e5e8eb]/70">
            <div>
              <p className="text-[13px] font-semibold text-[#191f28]">
                목록에 바로 공개하기
              </p>
              <p className="text-[11px] text-[#6b7684]">
                비활성화하면 준비 중 상태로 표시돼요
              </p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          {/* 7. 실시간 미리보기 (Live Preview) */}
          <div className="pt-1">
            <div className="flex items-center gap-1.5 text-xs text-[#8b95a1] mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#3182f6]" />
              <span>실시간 카드 미리보기</span>
            </div>
            <div className="rounded-2xl border border-[#e5e8eb] bg-white p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
                      active
                        ? "bg-[#e8f3ff] text-[#3182f6]"
                        : "bg-[#f2f4f6] text-[#8b95a1]"
                    }`}
                  >
                    {getLinkIcon(icon, "w-4 h-4")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${badgeStyle.bg}`}
                      >
                        {badgeStyle.label}
                      </span>
                      {!active && (
                        <Badge variant="red" size="xs">
                          준비 중
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-[14px] font-semibold text-[#191f28] truncate">
                      {title.trim() || "링크 제목이 여기에 표시돼요"}
                    </h4>
                    {description.trim() && (
                      <p className="text-[12px] text-[#6b7684] truncate mt-0.5">
                        {description.trim()}
                      </p>
                    )}
                    <div className="text-[11px] text-[#8b95a1] truncate mt-0.5">
                      {previewHost}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#b0b8c1] shrink-0" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" variant="primary" className="gap-1.5">
              <Plus className="w-4 h-4" />
              <span>추가하기</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
