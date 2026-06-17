"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StoryBar } from "@/components/story/StoryBar";
import { Feed } from "@/components/feed/Feed";
import { SuggestedUsers } from "@/components/feed/SuggestedUsers";
import { useUser } from "@/hooks/useUser";

export default function HomePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: "#f8f6f3" }}>
        <style>{`
          @keyframes float3d {
            0%, 100% { transform: translateY(0px) rotateY(0deg) rotateX(0deg); }
            33%       { transform: translateY(-10px) rotateY(12deg) rotateX(4deg); }
            66%       { transform: translateY(-5px) rotateY(-8deg) rotateX(-2deg); }
          }
          .logo-float { animation: float3d 4s ease-in-out infinite; filter: drop-shadow(0 12px 20px rgba(219,39,119,0.3)); }
        `}</style>

        <Image src="/logo.png" alt="Morsel" width={80} height={80} className="rounded-3xl mb-6 logo-float" />
        <h1 className="text-3xl font-black mb-2" style={{ background: "linear-gradient(135deg,#db2777,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Morsel
        </h1>
        <p className="text-gray-400 text-sm mb-10 max-w-xs">
          Discover food stories, recipes, and inspiration from people around the world.
        </p>

        <div className="w-full max-w-xs flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full py-3 rounded-2xl text-white font-semibold text-sm text-center transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#db2777,#a855f7)" }}
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="w-full py-3 rounded-2xl font-semibold text-sm text-center border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors bg-white"
          >
            Create account
          </Link>
          <button
            onClick={() => router.push("/browse")}
            className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Continue as guest →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto md:px-4 py-0 flex gap-8 justify-center">
      <div className="w-full max-w-[470px]">
        <StoryBar />
        <Feed />
      </div>
      <div className="hidden lg:block w-[300px] shrink-0 pt-6">
        <SuggestedUsers />
      </div>
    </div>
  );
}
