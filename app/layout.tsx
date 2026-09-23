import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escate Tech Gamer Giveaway",
  description: "Escate Tech Gamer Giveaway"
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
