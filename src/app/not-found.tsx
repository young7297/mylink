import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f2f4f6] font-sans">
      <Card className="w-full max-w-[460px] p-8 sm:p-10 flex flex-col items-center text-center bg-white shadow-toss-2 border border-[#e5e8eb]">
        <div className="w-16 h-16 rounded-3xl bg-[#fff0f1] text-[#f04452] flex items-center justify-center mb-5 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f2f4f6] text-[#6b7684] mb-3 tracking-wider">
          404 NOT FOUND
        </span>

        <h1 className="text-xl sm:text-2xl font-bold text-[#191f28] mb-2 tracking-tight">
          페이지를 찾을 수 없습니다
        </h1>

        <p className="text-sm text-[#4e5968] leading-relaxed max-w-[340px] mb-8">
          요청하신 페이지가 존재하지 않거나, 주소가 잘못 입력되었을 수 있어요.
        </p>

        <div className="w-full flex items-center justify-center">
          <Link href="/">
            <Button variant="primary" size="default" className="w-full sm:w-auto px-8 cursor-pointer">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
