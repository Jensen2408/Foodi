"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Search, PlusSquare, BookOpen, User, LogOut, ChefHat, Shield, Heart, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";

export function Navbar() {
  const { user, mutate } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        const lastSeenStr = localStorage.getItem("notif_seen");
        const items: { createdAt: string }[] = d.items ?? [];
        if (!lastSeenStr) { setNotifCount(items.length); return; }
        const lastSeen = new Date(lastSeenStr).getTime();
        setNotifCount(items.filter((i) => new Date(i.createdAt).getTime() > lastSeen).length);
      });
  }, [user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate(null);
    router.push("/auth/login");
  }

  const sidebarLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Explore" },
    { href: "/post/new", icon: PlusSquare, label: "Create" },
    { href: "/recipes", icon: BookOpen, label: "Recipes" },
    { href: "/notifications", icon: Bell, label: "Activity" },
    { href: user ? `/profile/${user.username}` : "/auth/login", icon: User, label: "Profile" },
  ];

  const mobileLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Explore" },
    ...(user ? [
      { href: "/post/new", icon: PlusSquare, label: "New" },
      { href: "/recipes", icon: BookOpen, label: "Recipes" },
      { href: `/profile/${user.username}`, icon: User, label: "Profile" },
    ] : []),
  ];

  return (
    <>
      {/* Desktop left sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col border-r border-white/[0.06]" style={{background:"#080c14"}}>
        {/* Logo */}
        <div className="px-5 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-gradient-brand">Foodi</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1">
          {sidebarLinks.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${
                  isActive
                    ? "bg-[#db2777]/15 text-[#db2777]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="font-medium text-sm">{label}</span>
                {label === "Activity" && notifCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-[#db2777] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom CTA */}
        <div className="px-4 pb-6 space-y-3">
          {user ? (
            <>
              {user.isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.04] text-xs transition-colors">
                  <Shield className="w-4 h-4 text-[#a855f7]" /> Admin Console
                </Link>
              )}
              <div className="p-3 rounded-2xl border border-white/[0.06]" style={{background:"rgba(255,255,255,0.03)"}}>
                <p className="text-xs text-white/40 mb-3 leading-snug">Share your culinary creations with the world</p>
                <Link
                  href="/post/new"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-brand text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <PlusSquare className="w-4 h-4" /> New Post
                </Link>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] text-xs transition-colors w-full"
              >
                <LogOut className="w-3.5 h-3.5" /> Log out
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/login" className="block w-full py-2.5 text-center text-sm font-semibold text-white/60 hover:text-white border border-white/[0.08] rounded-xl transition-colors">Log in</Link>
              <Link href="/auth/register" className="block w-full py-2.5 text-center text-sm font-semibold bg-gradient-brand text-white rounded-xl hover:opacity-90 transition-opacity">Sign up</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#080c14]/90 backdrop-blur-md border-b border-white/[0.06]">
        <nav className="max-w-[470px] mx-auto px-4 h-[44px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-gradient-brand">Foodi</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/post/new" className="text-white/50"><PlusSquare className="w-6 h-6" strokeWidth={1.5} /></Link>
                <Link href="/notifications" className="relative text-white/50">
                  <Heart className="w-6 h-6" strokeWidth={1.5} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#a855f7] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#080c14]">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-semibold text-white/60">Log in</Link>
                <Link href="/auth/register" className="px-3 py-1.5 text-sm font-semibold bg-gradient-brand text-white rounded-lg">Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080c14]/90 backdrop-blur-md border-t border-white/[0.06]">
          <div className="flex items-center justify-around h-12">
            {mobileLinks.map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center justify-center w-14 h-12 transition-colors ${pathname === href ? "text-white" : "text-white/30"}`}
              >
                <Icon className="w-6 h-6" strokeWidth={pathname === href ? 2.5 : 1.5} />
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
