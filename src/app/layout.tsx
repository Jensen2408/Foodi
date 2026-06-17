import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell } from "@/components/layout/AppShell";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = {
  title: "Morsel — Share Your Food Story",
  description: "The best place to share food photos, recipes, and food stories",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#f8f6f3] min-h-screen`}>
        <Navbar />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
