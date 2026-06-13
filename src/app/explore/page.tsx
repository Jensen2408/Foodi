"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface Post {
  id: string;
  images: { url: string }[];
  _count: { likes: number; comments: number };
}

interface User {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!query.trim()) { setUsers([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setUsers(data);
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const trendingTags = ["#pasta", "#sushi", "#dessert", "#vegan", "#brunch", "#baking", "#grilling", "#cocktails"];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#db2777]/40 placeholder:text-white/20"
          style={{background:"rgba(255,255,255,0.04)"}}
        />
      </div>

      {/* Trending tags */}
      {!query.trim() && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-1.5">
            <span className="text-[#db2777]">↗</span> Trending
          </p>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag.slice(1))}
                className="px-3 py-1.5 rounded-full border border-white/[0.08] text-white/50 text-sm hover:border-[#db2777]/50 hover:text-[#db2777] transition-colors"
                style={{background:"rgba(255,255,255,0.03)"}}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User search results */}
      {query.trim() && (
        <div className="mb-6 rounded-3xl border border-white/[0.06] overflow-hidden" style={{background:"#0f1520"}}>
          {searching && (
            <p className="text-sm text-white/40 text-center py-4">Searching...</p>
          )}
          {!searching && users.length === 0 && (
            <p className="text-sm text-white/40 text-center py-4">No users found</p>
          )}
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.username}`}
              onClick={() => setQuery("")}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors border-b border-white/[0.06] last:border-0"
            >
              <Avatar src={u.avatar} alt={u.username} size="md" />
              <div>
                <p className="font-semibold text-white">@{u.username}</p>
                {u.name && <p className="text-sm text-white/40">{u.name}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Photo grid */}
      {!query.trim() && (
        loading ? (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => <div key={i} className="aspect-square rounded-xl animate-pulse" style={{background:"rgba(255,255,255,0.06)"}} />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className={`relative overflow-hidden rounded-xl group ${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <div className="aspect-square relative">
                  {post.images[0] ? (
                    <Image src={post.images[0].url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full" style={{background:"rgba(255,255,255,0.06)"}} />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                    <span className="flex items-center gap-1 text-white text-sm font-bold">
                      <Heart className="w-4 h-4 fill-current" /> {post._count.likes}
                    </span>
                    <span className="flex items-center gap-1 text-white text-sm font-bold">
                      <MessageCircle className="w-4 h-4 fill-current" /> {post._count.comments}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
