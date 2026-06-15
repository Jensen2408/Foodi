"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Avatar } from "@/components/ui/avatar";

interface SuggestedUser {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  _count: { followers: number };
}

export function SuggestedUsers() {
  const { user } = useUser();
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/users/suggested").then((r) => r.json()).then(setUsers);
  }, []);

  async function follow(id: string) {
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: id }),
    });
    setFollowed((prev) => { const next = new Set(prev); next.add(id); return next; });
  }

  if (!user || users.length === 0) return null;

  return (
    <div className="sticky top-20 space-y-4">
      {/* Current user */}
      <div className="flex items-center gap-3">
        <Avatar src={user.avatar} alt={user.username} size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
          <p className="text-xs text-gray-400 truncate">{user.name ?? ""}</p>
        </div>
      </div>

      {/* Suggested */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400">Suggested for you</p>
          <Link href="/explore" className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">See all</Link>
        </div>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <Link href={`/profile/${u.username}`} className="shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden" style={{background:"rgba(0,0,0,0.05)"}}>
                  {u.avatar ? (
                    <Image src={u.avatar} alt={u.username} width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                      {u.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${u.username}`}>
                  <p className="text-xs font-semibold text-gray-900 truncate hover:text-purple-500 transition-colors">{u.username}</p>
                </Link>
                <p className="text-xs text-gray-400">{u._count.followers.toLocaleString()} followers</p>
              </div>
              <button
                onClick={() => follow(u.id)}
                disabled={followed.has(u.id)}
                className="text-xs font-semibold text-purple-500 hover:text-pink-500 disabled:text-gray-300 transition-colors"
              >
                {followed.has(u.id) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-300 leading-relaxed">© 2026 Morsel</p>
    </div>
  );
}
