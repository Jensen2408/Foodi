"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Search, PlusSquare, BookOpen, User, LogOut, ChefHat } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";

export function Navbar() {
  const { user, mutate } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate(null);
    router.push("/auth/login");
  }

  const navLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Search, label: "Search" },
    ...(user ? [
      { href: "/post/new", icon: PlusSquare, label: "Post" },
      { href: "/recipes", icon: BookOpen, label: "Recipes" },
      { href: `/profile/${user.username}`, icon: User, label: "Profile" },
    ] : []),
  ];

  return (
    <>
      {/* Top navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl text-gradient-brand tracking-tight">FoodGram</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`p-2.5 rounded-xl transition-colors ${pathname === href ? "text-orange-500 bg-orange-50" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
            {user ? (
              <div className="relative ml-1">
                <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-full">
                  <Avatar src={user.avatar} alt={user.username} size="sm" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
                    <hr className="border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/login" className="px-4 py-1.5 text-sm font-semibold text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                  Log in
                </Link>
                <Link href="/auth/register" className="px-4 py-1.5 text-sm font-semibold bg-gradient-brand text-white rounded-lg shadow hover:shadow-md transition-shadow">
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile top right */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <>
                <Link href="/auth/login" className="px-3 py-1.5 text-sm font-semibold text-orange-500">Log in</Link>
                <Link href="/auth/register" className="px-3 py-1.5 text-sm font-semibold bg-gradient-brand text-white rounded-lg">Sign up</Link>
              </>
            )}
            {user && (
              <button onClick={handleLogout} className="p-2 text-gray-500">
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
          <div className="flex items-center justify-around h-16 px-2">
            {navLinks.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  pathname === href ? "text-orange-500" : "text-gray-400"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
