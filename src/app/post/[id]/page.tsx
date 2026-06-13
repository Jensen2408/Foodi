"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Send, ArrowLeft, ChefHat, Clock, Users, MapPin, Bookmark } from "lucide-react";
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
        {[0,1,2].map((i) => <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
      </div>
    </div>
  );

  const recipe = post.recipe ? {
    ...post.recipe,
    ingredients: (() => { try { return JSON.parse(post.recipe.ingredients); } catch { return []; } })(),
    steps: (() => { try { return JSON.parse(post.recipe.steps); } catch { return []; } })(),
  } : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <Link href="javascript:history.back()" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/80 mb-5 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left: image(s) */}
        <div className="space-y-2">
          <div className="relative aspect-square rounded-2xl overflow-hidden" style={{background:"rgba(255,255,255,0.04)"}}>
            {post.images[imgIdx] && (
              <Image src={post.images[imgIdx].url} alt="" fill className="object-cover" />
            )}
          </div>
          {post.images.length > 1 && (
            <div className="flex gap-2">
              {post.images.map((img, i) => (
                <button key={img.id} onClick={() => setImgIdx(i)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 transition-all ${i === imgIdx ? "ring-2 ring-purple-500 opacity-100" : "opacity-40 hover:opacity-70"}`}>
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: details panel */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col" style={{background:"rgba(255,255,255,0.02)"}}>
          {/* Author header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
            <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
              <div className="p-0.5 rounded-full bg-gradient-brand shrink-0">
                <div className="p-0.5 rounded-full" style={{background:"#080c14"}}>
                  <Avatar src={post.user.avatar} alt={post.user.username} size="sm" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors leading-tight">
                  {post.user.name || post.user.username}
                </p>
                {post.location ? (
                  <p className="text-xs text-pink-400 flex items-center gap-0.5 leading-tight">
                    <MapPin className="w-2.5 h-2.5" /> {post.location}
                  </p>
                ) : (
                  <p className="text-xs text-white/30 leading-tight">@{post.user.username}</p>
                )}
              </div>
            </Link>
            <p className="text-xs text-white/25">{formatRelativeTime(post.createdAt)}</p>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm text-white/75 leading-relaxed">{post.caption}</p>
            </div>
          )}

          {/* Recipe card */}
          {recipe && (
            <div className="mx-4 my-3 p-3.5 rounded-xl border border-white/[0.07] space-y-3" style={{background:"rgba(168,85,247,0.06)"}}>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-purple-400" /> {recipe.title}
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {recipe.prepTime && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white/60 border border-white/[0.07]" style={{background:"rgba(255,255,255,0.04)"}}>
                    <Clock className="w-2.5 h-2.5 text-purple-400" /> {recipe.prepTime}m prep
                  </span>
                )}
                {recipe.cookTime && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white/60 border border-white/[0.07]" style={{background:"rgba(255,255,255,0.04)"}}>
                    <Clock className="w-2.5 h-2.5 text-purple-400" /> {recipe.cookTime}m cook
                  </span>
                )}
                {recipe.servings && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white/60 border border-white/[0.07]" style={{background:"rgba(255,255,255,0.04)"}}>
                    <Users className="w-2.5 h-2.5 text-purple-400" /> {recipe.servings} servings
                  </span>
                )}
                {recipe.difficulty && (
                  <span className="px-2 py-0.5 rounded-full text-purple-300 capitalize" style={{background:"rgba(168,85,247,0.15)"}}>
                    {recipe.difficulty}
                  </span>
                )}
              </div>
              {(recipe.ingredients as string[]).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Ingredients</p>
                  <ul className="space-y-0.5">
                    {(recipe.ingredients as string[]).map((ing, i) => (
                      <li key={i} className="text-xs text-white/55 flex gap-2">
                        <span className="text-purple-400 shrink-0">·</span>{ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(recipe.steps as string[]).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Steps</p>
                  <ol className="space-y-1.5">
                    {(recipe.steps as string[]).map((step, i) => (
                      <li key={i} className="text-xs text-white/55 flex gap-2">
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5 text-white" style={{background:"rgba(168,85,247,0.5)"}}>
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.06]">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 transition-all ${liked ? "text-pink-500" : "text-white/40 hover:text-pink-500"}`}
            >
              <Heart className={`w-5 h-5 transition-transform ${liked ? "fill-current scale-110" : ""}`} />
              <span className="text-sm font-semibold">{likeCount.toLocaleString()}</span>
            </button>
            <button className="text-white/30 hover:text-white/60 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Comments */}
          <div className="flex-1 overflow-y-auto px-4 space-y-3 py-2 max-h-64 border-t border-white/[0.06]">
            {comments.length === 0 && (
              <p className="text-xs text-white/20 text-center py-4">No comments yet</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar src={c.user.avatar} alt={c.user.username} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-relaxed">
                    <Link href={`/profile/${c.user.username}`} className="font-bold text-white/80 hover:text-purple-400 transition-colors mr-1.5">
                      {c.user.username}
                    </Link>
                    <span className="text-white/50">{c.text}</span>
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5">{formatRelativeTime(c.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          {user && (
            <form onSubmit={submitComment} className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.06]">
              <Avatar src={user.avatar} alt={user.username} size="xs" />
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 h-9 rounded-full px-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/[0.06]"
                style={{background:"rgba(255,255,255,0.04)"}}
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white disabled:opacity-30 transition-opacity shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
