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
      .then((d) => setNotifCount(d.count ?? 0));
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <nav className="max-w-[470px] md:max-w-5xl mx-auto px-4 h-[44px] md:h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <ChefHat className="w-5 h-5 text-[#c6185c]" />
            <span className="font-black text-xl tracking-tight text-gradient-brand">FoodGram</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                title={label}
                className={`p-2.5 rounded-lg transition-colors ${pathname === href ? "text-gray-950" : "text-gray-400 hover:text-gray-700"}`}
              >
                <Icon className="w-6 h-6" strokeWidth={pathname === href ? 2.5 : 1.5} />
              </Link>
            ))}

            {user ? (
              <div className="relative ml-2">
                <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full ring-2 ring-transparent hover:ring-[#f4b8d3] transition-all">
                  <Avatar src={user.avatar} alt={user.username} size="sm" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
                    <Link href={`/profile/${user.username}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <Avatar src={user.avatar} alt={user.username} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-400">View profile</p>
                      </div>
                    </Link>
                    <div className="border-t border-gray-100" />
                    {user.isAdmin && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                        <Shield className="w-4 h-4 text-[#c6185c]" />
                        <span className="text-sm text-gray-700">Admin Console</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors">
                      <LogOut className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/login" className="px-4 py-1.5 text-sm font-semibold text-[#9b1247] hover:bg-[#fdf2f7] rounded-lg transition-colors">Log in</Link>
                <Link href="/auth/register" className="px-4 py-1.5 text-sm font-semibold bg-gradient-brand text-white rounded-lg hover:opacity-90 transition-opacity">Sign up</Link>
              </div>
            )}
          </div>

          {/* Mobile top right */}
          <div className="flex md:hidden items-center gap-4">
            {user ? (
              <>
                <Link href="/post/new" className="text-gray-700"><PlusSquare className="w-6 h-6" strokeWidth={1.5} /></Link>
                <Link href="/notifications" className="relative text-gray-700">
                  <Heart className="w-6 h-6" strokeWidth={1.5} />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c6185c] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-semibold text-[#9b1247]">Log in</Link>
                <Link href="/auth/register" className="px-3 py-1.5 text-sm font-semibold bg-gradient-brand text-white rounded-lg">Sign up</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
          <div className="flex items-center justify-around h-12">
            {navLinks.map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center justify-center w-14 h-12 transition-colors ${pathname === href ? "text-gray-900" : "text-gray-400"}`}
              >
                <Icon className="w-6 h-6" strokeWidth={pathname === href ? 2.5 : 1.5} />
                {href === `/profile/${user.username}` && notifCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#c6185c] rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
