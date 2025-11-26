import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Japanese Study",
  description: "日本語の単語帳 - Japanese vocabulary study app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
