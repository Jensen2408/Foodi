"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Send, ArrowLeft, ChefHat, Clock, Users, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

interface Post {
  id: string;
  caption: string | null;
  location: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string | null; avatar: string | null };
  images: { id: string; url: string; order: number }[];
  recipe: { title: string; prepTime: number | null; cookTime: number | null; servings: number | null; difficulty: string | null; ingredients: string; steps: string } | null;
  comments: Comment[];
  _count: { likes: number; comments: number };
  likes?: { userId: string }[];
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [post, setPost] = useState<Post | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((p) => {
        setPost(p);
        setLiked((p.likes?.length ?? 0) > 0);
        setLikeCount(p._count.likes);
        setComments(p.comments ?? []);
      });
  }, [id]);

  async function toggleLike() {
    if (!user || !post) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const d = await res.json();
    setLiked(d.liked);
    setLikeCount((c) => c + (d.liked ? 1 : -1));
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || !post) return;
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: comment }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments((prev) => [...prev, c]);
      setComment("");
    }
  }

  if (!post) return (
    <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
      <div className="flex gap-1">
        {[0,1,2].map((i) => <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
      </div>
    </div>
  );

  const recipe = post.recipe ? {
    ...post.recipe,
    ingredients: (() => { try { return JSON.parse(post.recipe.ingredients); } catch { return []; } })(),
    steps: (() => { try { return JSON.parse(post.recipe.steps); } catch { return []; } })(),
  } : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="javascript:history.back()" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50">
            <Image src={post.images[imgIdx]?.url ?? ""} alt="" fill className="object-cover" />
          </div>
          {post.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {post.images.map((img, i) => (
                <button key={img.id} onClick={() => setImgIdx(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all ${i === imgIdx ? "ring-2 ring-brand-500" : "opacity-60"}`}>
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          {/* Author */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
              <Avatar src={post.user.avatar} alt={post.user.username} size="md" />
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{post.user.username}</p>
                {post.location && <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {post.location}</p>}
              </div>
            </Link>
            <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>
          </div>

          {post.caption && <p className="py-4 text-gray-800 leading-relaxed">{post.caption}</p>}

          {/* Like */}
          <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
            <button onClick={toggleLike} className={`flex items-center gap-2 transition-all ${liked ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}>
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span className="text-sm font-semibold">{likeCount.toLocaleString()}</span>
            </button>
          </div>

          {/* Recipe */}
          {recipe && (
            <div className="my-4 p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border border-orange-100 space-y-3">
              <h3 className="font-black text-gray-900 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-brand-500" /> {recipe.title}
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {recipe.prepTime && <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm"><Clock className="w-3 h-3 text-brand-500" /> {recipe.prepTime}m prep</span>}
                {recipe.cookTime && <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm"><Clock className="w-3 h-3 text-pink-500" /> {recipe.cookTime}m cook</span>}
                {recipe.servings && <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm"><Users className="w-3 h-3 text-purple-500" /> {recipe.servings}</span>}
                {recipe.difficulty && <span className="bg-white px-2.5 py-1 rounded-full shadow-sm capitalize">{recipe.difficulty}</span>}
              </div>
              {(recipe.ingredients as string[]).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Ingredients</p>
                  <ul className="space-y-1">{(recipe.ingredients as string[]).map((ing, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2"><span className="text-brand-400">•</span>{ing}</li>
                  ))}</ul>
                </div>
              )}
              {(recipe.steps as string[]).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Steps</p>
                  <ol className="space-y-1.5">{(recipe.steps as string[]).map((step, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                      <span className="w-4 h-4 bg-brand-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>{step}
                    </li>
                  ))}</ol>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-60 pr-1">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar src={c.user.avatar} alt={c.user.username} size="xs" />
                <div className="bg-gray-50 rounded-2xl px-3 py-2 flex-1">
                  <span className="text-xs font-semibold text-gray-900 mr-1.5">{c.user.username}</span>
                  <span className="text-xs text-gray-700">{c.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          {user && (
            <form onSubmit={submitComment} className="flex gap-2 pt-4 border-t border-gray-100 mt-4">
              <Avatar src={user.avatar} alt={user.username} size="xs" />
              <div className="flex-1 flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-9 bg-gray-50 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button type="submit" disabled={!comment.trim()}
                  className="w-9 h-9 bg-gradient-brand rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-opacity">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
