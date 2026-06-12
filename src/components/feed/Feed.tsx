"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { PostCard } from "@/components/post/PostCard";

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
  }, [loading, hasMore, cursor]);

  useEffect(() => {
    loadMore();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  if (!loading && posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🍕</p>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No posts yet</h3>
        <p className="text-gray-500 text-sm">Follow some food creators or share your first dish!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />)}
      <div ref={loaderRef} className="py-4 flex justify-center">
        {loading && (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
