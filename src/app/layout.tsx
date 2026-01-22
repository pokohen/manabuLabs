import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "일본어 공부 앱",
  description: "일본어 단어를 효과적으로 학습할 수 있는 앱입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
