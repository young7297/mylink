"use client";

import React, { useState } from "react";
import { LinkItem } from "@/types/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, getLinkIcon, Loader2 } from "@/components/icons";

export interface DeleteLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: LinkItem | null;
  onConfirmDelete: (link: LinkItem) => Promise<void> | void;
}

export default function DeleteLinkDialog({
  open,
  onOpenChange,
  link,
  onConfirmDelete,
}: DeleteLinkDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!link) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await onConfirmDelete(link);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Link delete error:", err);
      setErrorMessage(
        err?.message || "링크를 삭제하는 중 오류가 발생했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <DialogContent className="max-w-[420px] p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#feecee] text-[#f04452] flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 링크 이름 및 정보 표시 카드 */}
          <div className="p-3.5 rounded-2xl bg-[#f2f4f6]/80 border border-[#e5e8eb] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#3182f6] flex items-center justify-center shrink-0 shadow-xs">
              {getLinkIcon(link.icon, "w-5 h-5")}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-[#8b95a1] block">
                삭제 대상 링크
              </span>
              <h4 className="text-[14px] font-bold text-[#191f28] truncate mt-0.5">
                {link.title}
              </h4>
              <p className="text-[11px] text-[#6b7684] truncate mt-0.5">
                {link.url}
              </p>
            </div>
          </div>

          {/* 경고 문구 (빨간색) */}
          <div className="flex items-center gap-1.5 px-1 text-[13px] text-[#f04452] font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#f04452]" />
            <span>이 작업은 되돌릴 수 없습니다.</span>
          </div>

          {/* 에러 메시지 발생 시 */}
          {errorMessage && (
            <div className="p-3 bg-[#feecee] text-[#f04452] text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 gap-1.5 font-bold"
            aria-label={isDeleting ? "삭제 중" : "삭제하기"}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>삭제하기</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
