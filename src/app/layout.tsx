import type { Metadata, Viewport } from "next";
import "./globals.css";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import { AuthProvider } from "@/lib/authContext";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f2f4f6",
};

export const metadata: Metadata = {
  title: "마이페이지 | 내 손안의 링크 허브",
  description: "토스 디자인 시스템(TDS) 스타일로 정돈된 심플하고 직관적인 개인 링크 모음 서비스예요.",
  openGraph: {
    title: "마이페이지 | 내 손안의 링크 허브",
    description: "토스 블루와 깔끔한 화이트 카드 인터페이스의 링크 허브예요.",
    type: "website",
    locale: "ko_KR",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#f2f4f6] text-[#191f28]">
        <QueryProvider>
          <AuthProvider>
            <FirebaseAnalytics />
            <Toaster />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
