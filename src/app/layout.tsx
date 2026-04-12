"use client";

import "./globals.css"
import { ThreePreviewWrapper } from "@/components/Three";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>
        {children}
        <ThreePreviewWrapper />
      </body>
    </html>
  );
}