import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = {
  title: "FoodGram — Share Your Food Story",
  description: "The best place to share food photos, recipes, and food stories",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-[#080c14] min-h-screen`}>
        <Navbar />
        <main className="min-h-screen pt-14 pb-20 md:pt-8 md:pb-8 md:pl-60">{children}</main>
      </body>
    </html>
  );
}
