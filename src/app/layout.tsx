import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#7a8aba",
};

export const metadata: Metadata = {
  title: "Nintendo.com (Circa 2001) | 윤다영 (Dayoung Yoon) Web Console",
  description: "Nintendo.com circa 2001 is the web rendered as console hardware — brushed-periwinkle metal plates, edge-lit highlights, carbon command layers, and tactile wayfinding.",
  openGraph: {
    title: "Nintendo.com (Circa 2001) | 윤다영 (Dayoung Yoon) Web Console",
    description: "Brushed periwinkle metal plates, beveled chrome panels, and Y2K console hardware interface.",
    type: "website",
    locale: "ko_KR",
  },
  icons: {
    icon: "/mario-welcome.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={cn("h-full antialiased", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
