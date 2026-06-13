"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PostCard } from "@/components/post/PostCard";
import { SkeletonCard } from "./SkeletonCard";

interface Post {
  id: string;
  caption: string | null;
  location: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string | null; avatar: string | null };
  images: { id: string; url: string; order: number }[];
  recipe: { title: string; prepTime: number | null; cookTime: number | null; servings: number | null; difficulty: string | null; ingredients: string; steps: string } | null;
  _count: { likes: number; comments: number };
  likes?: { userId: string }[];
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const url = `/api/feed${cursor ? `?cursor=${cursor}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setPosts((prev) => [...prev, ...data.posts]);
    setCursor(data.nextCursor);
    setHasMore(!!data.nextCursor);
    setLoading(false);
    setInitialLoad(false);
  }, [loading, hasMore, cursor]);

  useEffect(() => { loadMore(); }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  if (initialLoad) {
    return (
      <div className="divide-y divide-white/[0.04]">
        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{background:"rgba(168,85,247,0.1)", border:"0.5px solid rgba(168,85,247,0.2)"}}>
          <svg className="w-9 h-9 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No posts yet</h3>
        <p className="text-sm text-white/40 mb-5 max-w-xs">Follow food creators or share your first dish to get started</p>
        <Link href="/post/new" className="px-5 py-2.5 bg-gradient-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">
          Share a photo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
      ))}
      <div ref={loaderRef} className="py-6 flex justify-center">
        {loading && <SkeletonCard />}
      </div>
    </div>
  );
}
