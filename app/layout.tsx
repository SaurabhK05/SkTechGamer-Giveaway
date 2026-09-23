import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SktechGamer Giveaway",
  description: "SktechGamer Giveaway"
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
