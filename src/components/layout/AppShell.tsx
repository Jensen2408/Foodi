"use client";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth/");

  return (
    <main className={isAuthPage ? "min-h-screen" : "min-h-screen pt-14 pb-20 md:pt-8 md:pb-8 md:pl-60"}>
      {children}
    </main>
  );
}
