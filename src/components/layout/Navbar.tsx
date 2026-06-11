"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Home, Search, PlusSquare, BookOpen, User, LogOut, ChefHat } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useUser } from "@/hooks/useUser";

export function Navbar() {
  const { user, mutate } = useUser();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate(null);
    router.push("/auth/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl text-gradient-brand tracking-tight">
            FoodGram
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link href="/" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-brand-600">
            <Home className="w-5 h-5" />
          </Link>
          <Link href="/explore" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-brand-600">
            <Search className="w-5 h-5" />
          </Link>
          {user && (
            <>
              <Link href="/post/new" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-brand-600">
                <PlusSquare className="w-5 h-5" />
              </Link>
              <Link href="/recipes" className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-brand-600">
                <BookOpen className="w-5 h-5" />
              </Link>
            </>
          )}

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="ml-1 rounded-full">
                <Avatar src={user.avatar} alt={user.username} size="sm" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up">
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Profile</span>
                  </Link>
                  <Link
                    href="/recipes/new"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">New Recipe</span>
                  </Link>
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
              <Link href="/auth/login" className="px-4 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                Log in
              </Link>
              <Link href="/auth/register" className="px-4 py-1.5 text-sm font-semibold bg-gradient-brand text-white rounded-lg shadow hover:shadow-md transition-shadow">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
