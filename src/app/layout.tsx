import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  title: "윤다영 | 주니어 프론트엔드 개발자 프로필",
  description: "직관적인 UI와 더 나은 사용자 경험을 고민하는 개발자 윤다영의 프로필 링크입니다.",
  openGraph: {
    title: "윤다영 | 주니어 프론트엔드 개발자 프로필",
    description: "직관적인 UI와 더 나은 사용자 경험을 고민하는 개발자 윤다영의 프로필 링크입니다.",
    type: "profile",
    locale: "ko_KR",
  },
  icons: {
    icon: "/avatar.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
