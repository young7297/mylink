"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, User, ArrowUpRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/authContext";
import { getEmailPrefix } from "@/lib/utils";

interface UserNotFoundViewProps {
  displayName?: string;
}

export default function UserNotFoundView({ displayName }: UserNotFoundViewProps) {
  const { user, userProfile } = useAuth();
  const decodedName = displayName ? decodeURIComponent(displayName) : "요청한 사용자";
  const myDisplayName = userProfile?.displayName || userProfile?.name || getEmailPrefix(user?.email, "사용자");

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 py-16 flex flex-col items-center text-center">
      <Card className="w-full p-8 sm:p-10 flex flex-col items-center bg-white shadow-toss-1 border border-[#e5e8eb]">
        {/* 404 경고 아이콘 */}
        <div className="w-16 h-16 rounded-3xl bg-[#fff0f1] text-[#f04452] flex items-center justify-center mb-5 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        {/* 404 뱃지 */}
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f2f4f6] text-[#6b7684] mb-3 tracking-wider">
          404 NOT FOUND
        </span>

        {/* 헤딩 */}
        <h1 className="text-xl sm:text-2xl font-bold text-[#191f28] mb-2 tracking-tight">
          사용자를 찾을 수 없습니다
        </h1>

        {/* 설명 문구 */}
        <p className="text-sm text-[#4e5968] leading-relaxed max-w-[360px] mb-2">
          <span className="font-semibold text-[#191f28]">‘{decodedName}’</span> 님의
          링크 페이지가 존재하지 않거나 잘못된 주소예요.
        </p>

        <p className="text-xs text-[#8b95a1] leading-relaxed mb-8">
          주소창의 닉네임(displayName) 철자를 다시 한번 확인해 주세요.
        </p>

        {/* 액션 버튼 그룹 */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="default" className="w-full px-6 cursor-pointer">
              홈으로 돌아가기
            </Button>
          </Link>

          {user && (
            <Link href={`/${encodeURIComponent(myDisplayName)}`} className="w-full sm:w-auto">
              <Button variant="secondary" size="default" className="w-full px-6 cursor-pointer gap-1.5">
                <User className="w-3.5 h-3.5 text-[#3182f6]" />
                <span>내 페이지로 가기</span>
                <ArrowUpRight className="w-3 h-3 text-[#3182f6]" />
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
