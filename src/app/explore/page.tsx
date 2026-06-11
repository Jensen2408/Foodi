"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Heart, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  images: { url: string }[];
  _count: { likes: number; comments: number };
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts ?? []); setLoading(false); });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Explore</h1>
        <p className="text-gray-500 text-sm mt-1">Discover amazing food from the community</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Search food, recipes, creators..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className={`relative overflow-hidden rounded-xl group ${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`}
            >
              <div className={`${i % 5 === 0 ? "aspect-square" : "aspect-square"} relative`}>
                {post.images[0] ? (
                  <Image src={post.images[0].url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-100 to-pink-100" />
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
      )}
    </div>
  );
}
