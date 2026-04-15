import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "備品貸出管理",
  description: "QRコードで備品の貸出・返却を管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          {/* 背景画像 */}
          <div
            className="fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bg.jpg')" }}
          />
          {/* 読みやすくするための白半透明オーバーレイ */}
          <div className="fixed inset-0 -z-10 bg-white/60" />

          <nav className="border-b bg-white/80 backdrop-blur-sm px-4 py-3">
            <div className="max-w-2xl mx-auto flex gap-5 flex-wrap">
              <Link href="/equipment" className="text-sm font-medium hover:underline">
                備品一覧
              </Link>
              <Link href="/status" className="text-sm font-medium hover:underline">
                貸出状況
              </Link>
              <Link href="/history" className="text-sm font-medium hover:underline">
                履歴
              </Link>
              <Link href="/scan" className="text-sm font-medium hover:underline">
                スキャン
              </Link>
            </div>
          </nav>
          {children}
        </body>
    </html>
  );
}
