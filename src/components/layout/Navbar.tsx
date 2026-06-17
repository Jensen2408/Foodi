"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Plus, BookOpen, Bell, User, LogOut } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications/unread-count")
      .then((r) => r.json())
      .then((d) => setNotifCount(d.count ?? 0))
      .catch(() => {});
  }, [user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

  const sidebarLinks: { href: string; icon: React.ElementType; label: string; badge?: number }[] = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Explore" },
    { href: "/recipes", icon: BookOpen, label: "Recipes" },
    { href: "/notifications", icon: Bell, label: "Activity", badge: notifCount },
    ...(user ? [{ href: `/profile/${user.username}`, icon: User, label: "Profile" }] : [{ href: "/auth/login", icon: User, label: "Profile" }]),
  ];

  const isAuthPage = pathname.startsWith("/auth/");
  if (isAuthPage) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col border-r border-gray-200 z-40 bg-white">
        <div className="px-6 py-6 mb-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Morsel" width={32} height={32} className="rounded-xl" />
            <span className="font-bold text-gray-900 text-lg">Morsel</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {sidebarLinks.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  active ? "bg-[#db2777]/10 text-[#db2777]" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
                {(badge ?? 0) > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#db2777] text-white text-[10px] font-bold flex items-center justify-center">
                    {(badge ?? 0) > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-6 space-y-3">
          {user && (
            <Link href="/post/new" className="block w-full py-2.5 rounded-xl text-white text-sm font-semibold text-center transition-opacity hover:opacity-90"
              style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
              + New Post
            </Link>
          )}
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-600 text-sm transition-colors w-full">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          )}
          {!user && (
            <Link href="/auth/login" className="block w-full py-2.5 rounded-xl text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
              Sign in
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40 border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Morsel" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-gray-900">Morsel</span>
        </Link>
        <Link href="/notifications" className="relative p-2">
          <Bell className="w-5 h-5 text-gray-500" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#db2777] text-white text-[9px] font-bold flex items-center justify-center">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center border-t border-gray-200 z-40 bg-white">
        <Link href="/" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${pathname === "/" ? "text-[#db2777]" : "text-gray-400"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/explore" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${pathname.startsWith("/explore") ? "text-[#db2777]" : "text-gray-400"}`}>
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </Link>
        <div className="flex-1 flex justify-center">
          <Link href="/post/new" className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg -mt-4"
            style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </Link>
        </div>
        <Link href="/notifications" className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors relative ${pathname.startsWith("/notifications") ? "text-[#db2777]" : "text-gray-400"}`}>
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-6 w-4 h-4 rounded-full bg-[#db2777] text-white text-[9px] font-bold flex items-center justify-center">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
          <span className="text-[10px]">Activity</span>
        </Link>
        <Link href={user ? `/profile/${user.username}` : "/auth/login"}
          className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${pathname.startsWith("/profile") ? "text-[#db2777]" : "text-gray-400"}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>
    </>
  );
}
