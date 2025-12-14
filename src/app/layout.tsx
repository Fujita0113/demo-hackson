import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Studyplus",
  description: "開発者向け日報のスケッチ版 UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${nunito.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
