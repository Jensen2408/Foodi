"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Plus, BookOpen, Bell, User, LogOut, ChefHat } from "lucide-react";
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
    router.push("/login");
  }

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Explore" },
    { href: "/post/new", icon: Plus, label: "Create" },
    { href: "/recipes", icon: BookOpen, label: "Recipes" },
    { href: "/notifications", icon: Bell, label: "Activity", badge: notifCount },
    ...(user ? [{ href: `/profile/${user.username}`, icon: User, label: "Profile" }] : []),
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col border-r border-white/[0.06] z-40" style={{background:"#080c14"}}>
        {/* Logo */}
        <div className="px-6 py-6 mb-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg">FoodGram</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1">
          {links.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  active
                    ? "bg-[#db2777]/15 text-[#db2777]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
                {badge > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#db2777] text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: New Post card + logout */}
        <div className="px-3 pb-6 space-y-3">
          {user && (
            <Link href="/post/new" className="block w-full py-2.5 rounded-xl text-white text-sm font-semibold text-center transition-opacity hover:opacity-90"
              style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
              + New Post
            </Link>
          )}
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 text-sm transition-colors w-full">
              <LogOut className="w-4 h-4" /> Log out
            </button>
          )}
          {!user && (
            <Link href="/login" className="block w-full py-2.5 rounded-xl text-white text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
              Sign in
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40 border-b border-white/[0.06]" style={{background:"#080c14"}}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
            <ChefHat className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white">FoodGram</span>
        </Link>
        <Link href="/notifications" className="relative p-2">
          <Bell className="w-5 h-5 text-white/60" />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#db2777] text-white text-[9px] font-bold flex items-center justify-center">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 flex items-center border-t border-white/[0.06] z-40 px-2" style={{background:"#080c14"}}>
        {links.filter(l => l.label !== "Activity").map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${active ? "text-[#db2777]" : "text-white/30 hover:text-white/60"}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
