"use client";

import React, { useState, useEffect, useRef } from "react";
import { LinkItem } from "@/types/link";
import {
  getLinkIcon,
  getCategoryBadgeStyle,
  ChevronRight,
  Trash2,
  Pencil,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AVAILABLE_ICONS,
  CATEGORY_SELECT_OPTIONS,
  validateTitleField,
  validateUrlField,
  validateDescriptionField,
} from "@/lib/linkValidation";

interface LinkCardProps {
  link: LinkItem;
  index: number;
  existingLinks?: LinkItem[];
  onOpenLink?: (link: LinkItem) => void;
  onDeleteLink?: (link: LinkItem) => void;
  onUpdateLink?: (
    id: string,
    updated: Partial<Omit<LinkItem, "id">>
  ) => Promise<void> | void;
}

/**
 * 수정 일시(updatedAt) 포맷 헬퍼 (YYYY.MM.DD HH:mm)
 */
function formatUpdatedAt(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch {
    return null;
  }
}

export default function LinkCard({
  link,
  index,
  existingLinks = [],
  onOpenLink,
  onDeleteLink,
  onUpdateLink,
}: LinkCardProps) {
  const badgeStyle = getCategoryBadgeStyle(link.category);
  const isActive = link.active !== false;

  // 인라인 편집 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 편집 폼 필드 상태
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editDescription, setEditDescription] = useState(link.description || "");
  const [editCategory, setEditCategory] = useState<string>(link.category || "projects");
  const [editIcon, setEditIcon] = useState<string>(link.icon || "link");
  const [editActive, setEditActive] = useState<boolean>(link.active !== false);

  // 수동 선택 여부 (URL 자동 감지 덮어쓰기 방지)
  const [isManualIcon, setIsManualIcon] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);

  // 유효성 검사 에러 상태
  const [errors, setErrors] = useState<{
    title?: string;
    url?: string;
    description?: string;
  }>({});

  const [touched, setTouched] = useState<{
    title?: boolean;
    url?: boolean;
    description?: boolean;
  }>({});

  // 저장 중 상태 및 에러 메시지
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 인풋 포커스용 ref
  const titleInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // props가 변경되거나 편집 모드로 진입할 때 폼 초기화
  useEffect(() => {
    if (isEditing) {
      setEditTitle(link.title);
      setEditUrl(link.url);
      setEditDescription(link.description || "");
      setEditCategory(link.category || "projects");
      setEditIcon(link.icon || "link");
      setEditActive(link.active !== false);
      setErrors({});
      setTouched({});
      setIsManualIcon(false);
      setIsManualCategory(false);
      setIsSaving(false);
      setSaveError(null);
    }
  }, [isEditing, link]);

  // URL에서 도메인 추출 (표시용)
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

  const handleClick = (e: React.MouseEvent) => {
    // 인라인 편집 모드일 때는 링크 이동 방지
    if (isEditing) return;

    e.preventDefault();
    if (!isActive) return;
    if (onOpenLink) {
      onOpenLink(link);
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
  };

  // 제목 변경 핸들러
  const handleTitleChange = (val: string) => {
    setEditTitle(val);
    if (touched.title) {
      setErrors((prev) => ({ ...prev, title: validateTitleField(val) }));
    }
  };

  // URL 변경 핸들러 (스마트 자동 감지 + 실시간 검증)
  const handleUrlChange = (value: string) => {
    setEditUrl(value);
    if (touched.url) {
      const { error } = validateUrlField(value, existingLinks, link.id);
      setErrors((prev) => ({ ...prev, url: error }));
    }

    const lower = value.toLowerCase().trim();
    if (!isManualIcon) {
      if (lower.includes("instagram.com")) {
        setEditIcon("instagram");
        if (!isManualCategory) setEditCategory("social");
      } else if (lower.includes("github.com")) {
        setEditIcon("github");
        if (!isManualCategory) setEditCategory("codes");
      } else if (lower.includes("linkedin.com")) {
        setEditIcon("linkedin");
        if (!isManualCategory) setEditCategory("social");
      } else if (lower.includes("figma.com")) {
        setEditIcon("figma");
        if (!isManualCategory) setEditCategory("skills");
      } else if (
        lower.includes("velog.io") ||
        lower.includes("blog.") ||
        lower.includes("tistory.com")
      ) {
        setEditIcon("blog");
        if (!isManualCategory) setEditCategory("skills");
      } else if (
        lower.includes("notion.so") ||
        lower.includes("notion.site")
      ) {
        setEditIcon("file-text");
        if (!isManualCategory) setEditCategory("projects");
      } else if (lower.startsWith("mailto:")) {
        setEditIcon("mail");
        if (!isManualCategory) setEditCategory("contact");
      } else if (
        lower.includes("kakao.com") ||
        lower.includes("open.kakao")
      ) {
        setEditIcon("message-circle");
        if (!isManualCategory) setEditCategory("contact");
      }
    }
  };

  // 설명 변경 핸들러
  const handleDescriptionChange = (val: string) => {
    setEditDescription(val);
    if (touched.description) {
      setErrors((prev) => ({ ...prev, description: validateDescriptionField(val) }));
    }
  };

  // 블러 핸들러
  const handleBlur = (field: "title" | "url" | "description") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "title") {
      setErrors((prev) => ({ ...prev, title: validateTitleField(editTitle) }));
    } else if (field === "url") {
      const { error } = validateUrlField(editUrl, existingLinks, link.id);
      setErrors((prev) => ({ ...prev, url: error }));
    } else if (field === "description") {
      setErrors((prev) => ({ ...prev, description: validateDescriptionField(editDescription) }));
    }
  };

  // 인라인 수정 저장 제출 핸들러
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaveError(null);

    setTouched({ title: true, url: true, description: true });

    const titleErr = validateTitleField(editTitle);
    const { error: urlErr, formattedUrl } = validateUrlField(editUrl, existingLinks, link.id);
    const descErr = validateDescriptionField(editDescription);

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

    if (!onUpdateLink) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateLink(link.id, {
        title: editTitle.trim(),
        url: formattedUrl,
        description: editDescription.trim() || undefined,
        category: editCategory,
        icon: editIcon,
        active: editActive,
      });

      setIsEditing(false);
    } catch (err: any) {
      console.error("Link update error:", err);
      setSaveError(err?.message || "링크 수정 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // 인라인 수정 취소 핸들러
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setSaveError(null);
  };

  // =========================================================================
  // 1. 인라인 편집 UI 모드
  // =========================================================================
  if (isEditing) {
    const isTitleValid = touched.title && !errors.title && editTitle.trim().length >= 2;
    const isUrlValid = touched.url && !errors.url && editUrl.trim().length > 0;

    return (
      <div
        className="w-full bg-[#f9fafb] border-2 border-[#3182f6]/50 rounded-2xl p-4 sm:p-5 shadow-xs transition-all my-1.5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 인라인 편집 헤더 */}
        <div className="flex items-center justify-between pb-2 border-b border-[#e5e8eb] flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#3182f6] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <Pencil className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-[14px] font-bold text-[#191f28]">링크 인라인 수정</h4>
          </div>
          {link.updatedAt ? (
            <span className="text-[11px] text-[#8b95a1]">
              마지막 수정: {formatUpdatedAt(link.updatedAt)}
            </span>
          ) : (
            <span className="text-[11px] text-[#8b95a1]">
              수정 후 [저장하기]를 누르면 즉시 반영돼요
            </span>
          )}
        </div>

        <form onSubmit={handleSave} noValidate className="space-y-3.5">
          {/* 1. 링크 제목 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`edit-title-${link.id}`}
                className="text-[12px] font-semibold text-[#191f28] flex items-center gap-1"
              >
                링크 제목 <span className="text-[#f04452]">*</span>
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  editTitle.length > 50 ? "text-[#f04452] font-semibold" : "text-[#8b95a1]"
                }`}
              >
                {editTitle.length}/50자
              </span>
            </div>

            <div className="relative flex items-center">
              <Input
                id={`edit-title-${link.id}`}
                ref={titleInputRef}
                type="text"
                maxLength={60}
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => handleBlur("title")}
                placeholder="예: 내 인스타그램, GitHub 포트폴리오"
                className={`h-9 text-[13px] ${
                  touched.title && errors.title
                    ? "border-[#f04452] focus:border-[#f04452] focus:ring-[#f04452]/15 pr-8"
                    : isTitleValid
                    ? "border-[#00b569]/60 focus:border-[#00b569] focus:ring-[#00b569]/15 pr-8"
                    : ""
                }`}
                autoFocus
              />
              {isTitleValid && (
                <CheckCircle2 className="absolute right-2.5 w-4 h-4 text-[#00b569] pointer-events-none" />
              )}
            </div>

            {touched.title && errors.title && (
              <p className="text-[11px] text-[#f04452] font-medium flex items-center gap-1 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* 2. 링크 주소(URL) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`edit-url-${link.id}`}
                className="text-[12px] font-semibold text-[#191f28] flex items-center gap-1"
              >
                링크 주소 (URL) <span className="text-[#f04452]">*</span>
              </label>
              <span className="text-[11px] text-[#8b95a1]">
                자동 아이콘 감지 지원
              </span>
            </div>

            <div className="relative flex items-center">
              <Input
                id={`edit-url-${link.id}`}
                ref={urlInputRef}
                type="url"
                value={editUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                onBlur={() => handleBlur("url")}
                placeholder="예: https://instagram.com/my_id"
                className={`h-9 text-[13px] ${
                  touched.url && errors.url
                    ? "border-[#f04452] focus:border-[#f04452] focus:ring-[#f04452]/15 pr-8"
                    : isUrlValid
                    ? "border-[#00b569]/60 focus:border-[#00b569] focus:ring-[#00b569]/15 pr-8"
                    : ""
                }`}
              />
              {isUrlValid && (
                <CheckCircle2 className="absolute right-2.5 w-4 h-4 text-[#00b569] pointer-events-none" />
              )}
            </div>

            {touched.url && errors.url && (
              <p className="text-[11px] text-[#f04452] font-medium flex items-center gap-1 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.url}</span>
              </p>
            )}
          </div>

          {/* 3. 카테고리 선택 */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-[#191f28]">
              카테고리
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORY_SELECT_OPTIONS.map((cat) => {
                const isSelected = editCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setEditCategory(cat.value);
                      setIsManualCategory(true);
                    }}
                    className={`h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#191f28] text-white shadow-xs ring-1 ring-[#191f28]"
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
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-[#191f28]">
                아이콘 선택
              </label>
              <span className="text-[11px] text-[#8b95a1]">
                현재: <strong className="text-[#3182f6]">{editIcon}</strong>
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-[110px] overflow-y-auto p-1.5 bg-white rounded-xl border border-[#e5e8eb]">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = editIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setEditIcon(item.id);
                      setIsManualIcon(true);
                    }}
                    title={item.label}
                    className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-[#e8f3ff] text-[#3182f6] shadow-xs ring-1 ring-[#3182f6]"
                        : "bg-transparent text-[#6b7684] hover:bg-[#f2f4f6] hover:text-[#191f28]"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {getLinkIcon(item.id, "w-3.5 h-3.5")}
                    </div>
                    <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. 설명 입력 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`edit-desc-${link.id}`}
                className="text-[12px] font-semibold text-[#191f28]"
              >
                설명{" "}
                <span className="text-[11px] text-[#8b95a1] font-normal">
                  (선택)
                </span>
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  editDescription.length > 100
                    ? "text-[#f04452] font-semibold"
                    : "text-[#8b95a1]"
                }`}
              >
                {editDescription.length}/100자
              </span>
            </div>
            <Input
              id={`edit-desc-${link.id}`}
              type="text"
              maxLength={110}
              value={editDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => handleBlur("description")}
              placeholder="예: 프로젝트 회고와 개발 일상을 기록해요"
              className={`h-9 text-[13px] ${
                touched.description && errors.description
                  ? "border-[#f04452] focus:border-[#f04452] focus:ring-[#f04452]/15"
                  : ""
              }`}
            />
            {touched.description && errors.description && (
              <p className="text-[11px] text-[#f04452] font-medium flex items-center gap-1 pl-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* 6. 활성화 상태 토글 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#e5e8eb]">
            <div>
              <p className="text-[12px] font-semibold text-[#191f28]">
                목록에 바로 공개하기
              </p>
              <p className="text-[11px] text-[#6b7684]">
                비활성화하면 준비 중 상태로 표시돼요
              </p>
            </div>
            <Switch checked={editActive} onCheckedChange={setEditActive} />
          </div>

          {/* 에러 메시지 안내 */}
          {saveError && (
            <div className="p-2.5 bg-[#feecee] text-[#f04452] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* 인라인 편집 버튼 영역: [취소] [저장하기] */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e5e8eb]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8 px-3 text-xs"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="h-8 px-4 text-xs gap-1.5 min-w-[72px]"
              aria-label={isSaving ? "저장 중" : "저장하기"}
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>저장하기</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // =========================================================================
  // 2. 기본 링크 카드 표시 모드 (수정/삭제 버튼 항상 표시)
  // =========================================================================
  return (
    <div
      role="link"
      tabIndex={isActive ? 0 : -1}
      aria-disabled={!isActive}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && isActive && !isEditing) {
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      className={`group relative w-full select-none transition-all duration-150 rounded-2xl ${
        isActive
          ? "cursor-pointer hover:bg-[#f9fafb] active:bg-[#f2f4f6]"
          : "cursor-not-allowed opacity-45"
      }`}
    >
      <div className="flex items-center justify-between p-3.5 sm:p-4 gap-2.5 sm:gap-3">
        {/* 좌측: 44px 아바타/아이콘 컨테이너 + 텍스트 */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
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

            {/* 도메인 주소 및 수정 시각 */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#8b95a1] font-normal truncate mt-0.5 flex-wrap">
              <span className="truncate">{displayHost}</span>
              {link.updatedAt && (
                <>
                  <span className="text-[#d1d6db]">·</span>
                  <span className="shrink-0 text-[#8b95a1]">
                    수정: {formatUpdatedAt(link.updatedAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 우측: 수정 & 삭제 액션 버튼 (항상 표시) & TDS Chevron Right 화살표 */}
        <div className="shrink-0 flex items-center justify-end gap-1 pl-1">
          {/* 1. 수정 버튼 (항상 표시) */}
          {onUpdateLink && (
            <button
              type="button"
              aria-label="링크 수정"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[#6b7684] hover:text-[#3182f6] hover:bg-[#e8f3ff] active:bg-[#d5e7ff] transition-all cursor-pointer text-xs font-semibold"
              title="링크 수정"
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">수정</span>
            </button>
          )}

          {/* 2. 삭제 버튼 (항상 표시) */}
          {onDeleteLink && (
            <button
              type="button"
              aria-label="링크 삭제"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteLink(link);
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[#8b95a1] hover:text-[#f04452] hover:bg-[#feecee] active:bg-[#fdd8db] transition-all cursor-pointer text-xs font-semibold"
              title="링크 삭제"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">삭제</span>
            </button>
          )}

          <ChevronRight className="w-5 h-5 text-[#b0b8c1] group-hover:text-[#3182f6] group-hover:translate-x-0.5 transition-all ml-0.5" />
        </div>
      </div>
    </div>
  );
}
