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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-pink-900">Explore</h1>
        <p className="text-blue-500 text-sm mt-1">Discover amazing food from the community</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-blue-200 bg-white/80 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-blue-400"
        />
      </div>

      {/* User search results */}
      {query.trim() && (
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
          {searching && (
            <p className="text-sm text-blue-500 text-center py-4">Searching...</p>
          )}
          {!searching && users.length === 0 && (
            <p className="text-sm text-blue-500 text-center py-4">No users found</p>
          )}
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.username}`}
              onClick={() => setQuery("")}
              className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-blue-50 last:border-0"
            >
              <Avatar src={u.avatar} alt={u.username} size="md" />
              <div>
                <p className="font-semibold text-gray-900">@{u.username}</p>
                {u.name && <p className="text-sm text-blue-500">{u.name}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Photo grid */}
      {!query.trim() && (
        loading ? (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => <div key={i} className="aspect-square bg-blue-100 rounded-xl animate-pulse" />)}
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
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-fuchsia-100" />
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
