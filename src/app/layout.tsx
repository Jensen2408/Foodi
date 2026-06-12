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
      <body className={`${inter.variable} font-sans bg-[#fafafa] min-h-screen`}>
        <Navbar />
        <main className="min-h-screen pt-14 pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
