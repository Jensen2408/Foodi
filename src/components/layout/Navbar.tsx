"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, Search, PlusSquare, BookOpen, User, LogOut, ChefHat, Shield, Heart } from "lucide-react";
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
        if (!lastSeenStr) {
          setNotifCount(items.length);
          return;
        }
        const lastSeen = new Date(lastSeenStr).getTime();
        const count = items.filter((i) => new Date(i.createdAt).getTime() > lastSeen).length;
        setNotifCount(count);
      });
  }, [user]);


  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate(null);
    router.push("/auth/login");
  }

  const navLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Search" },
    ...(user ? [
      { href: "/post/new", icon: PlusSquare, label: "New" },
      { href: "/recipes", icon: BookOpen, label: "Recipes" },
      { href: `/profile/${user.username}`, icon: User, label: "Profile" },
    ] : []),
  ];

  return (
    <>
      {/* Top navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080c14]/90 backdrop-blur-md border-b border-white/[0.06]">
        <nav className="max-w-[470px] md:max-w-5xl mx-auto px-4 h-[44px] md:h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-gradient-brand">FOODGRAM</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                title={label}
                className={`p-2.5 rounded-lg transition-colors ${pathname === href ? "text-white" : "text-white/30 hover:text-white/70"}`}
              >
                <Icon className="w-6 h-6" strokeWidth={pathname === href ? 2.5 : 1.5} />
              </Link>
            ))}

            {user && (
              <Link href="/notifications" title="Notifications" className={`relative p-2.5 rounded-lg transition-colors ${pathname === "/notifications" ? "text-white" : "text-white/30 hover:text-white/70"}`}>
                <Heart className="w-6 h-6" strokeWidth={pathname === "/notifications" ? 2.5 : 1.5} />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#a855f7] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#080c14]">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="relative ml-2">
                <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full ring-2 ring-transparent hover:ring-purple-500/40 transition-all">
                  <Avatar src={user.avatar} alt={user.username} size="sm" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-[#0f1520] rounded-2xl border border-white/[0.08] overflow-hidden animate-slide-up">
                    <Link href={`/profile/${user.username}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors">
                      <Avatar src={user.avatar} alt={user.username} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-white">{user.username}</p>
                        <p className="text-xs text-white/40">View profile</p>
                      </div>
                    </Link>
                    <div className="border-t border-white/[0.06]" />
                    {user.isAdmin && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors" onClick={() => setMenuOpen(false)}>
                        <Shield className="w-4 h-4 text-[#a855f7]" />
                        <span className="text-sm text-white/70">Admin Console</span>
                      </Link>
                    )}
                    <div className="border-t border-white/[0.06]" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] text-white/70 transition-colors">
                      <LogOut className="w-4 h-4 text-white/30" />
                      <span className="text-sm">Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/login" className="px-4 py-1.5 text-sm font-semibold text-white/60 hover:text-white transition-colors">Log in</Link>
                <Link href="/auth/register" className="px-4 py-1.5 text-sm font-semibold bg-gradient-brand text-white rounded-lg hover:opacity-90 transition-opacity">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile top right */}
          <div className="flex md:hidden items-center gap-4">
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
            {navLinks.map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center justify-center w-14 h-12 transition-colors ${pathname === href ? "text-white" : "text-white/30"}`}
              >
                <Icon className="w-6 h-6" strokeWidth={pathname === href ? 2.5 : 1.5} />
                {href === `/profile/${user.username}` && notifCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#a855f7] rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
