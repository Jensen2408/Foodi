"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, MapPin, ChefHat, Clock, Users, Trash2, Flag, Share2, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";

interface PostRecipe {
  title: string;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string | null;
  ingredients: string;
  steps: string;
}

interface Post {
  id: string;
  caption: string | null;
  location: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string | null; avatar: string | null };
  images: { id: string; url: string; order: number }[];
  recipe: PostRecipe | null;
  taggedUsers?: { user: { id: string; username: string; avatar: string | null } }[];
  _count: { likes: number; comments: number };
  likes?: { userId: string }[];
}

export function PostCard({ post: initial, onDelete }: { post: Post; onDelete?: (id: string) => void }) {
  const { user } = useUser();
  const [post] = useState(initial);
  const [liked, setLiked] = useState((initial.likes?.length ?? 0) > 0);
  const [likeCount, setLikeCount] = useState(initial._count.likes);
  const [imgIdx, setImgIdx] = useState(0);
  const [showRecipe, setShowRecipe] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{ id: string; text: string; user: { username: string } }[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [doubleTapHeart, setDoubleTapHeart] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = user?.id === post.user.id;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function toggleLike() {
    if (!user) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => c + (data.liked ? 1 : -1));
  }

  function handleDoubleTap() {
    if (!liked) {
      toggleLike();
      setDoubleTapHeart(true);
      setTimeout(() => setDoubleTapHeart(false), 1000);
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) onDelete?.(post.id);
  }

  function handleReport() {
    setMenuOpen(false);
    alert("Report submitted. We'll review this post.");
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
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

  const recipe = post.recipe
    ? {
        ...post.recipe,
        ingredients: (() => { try { return JSON.parse(post.recipe.ingredients); } catch { return []; } })(),
        steps: (() => { try { return JSON.parse(post.recipe.steps); } catch { return []; } })(),
      }
    : null;

  return (
    <article className="rounded-2xl overflow-hidden border border-white/[0.07]" style={{background:"rgba(255,255,255,0.03)"}}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
          <div className="p-0.5 rounded-full bg-gradient-brand">
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

        <div className="flex items-center gap-2">
          {post.recipe && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#db2777]/40 text-[#db2777] text-xs font-semibold">
              <Bookmark className="w-3 h-3" /> Recipe
            </span>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-[#0f1520]/[0.06] transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-white/30" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-52 rounded-2xl border border-white/[0.08] overflow-hidden z-50 animate-slide-up" style={{background:"#0f1520"}}>
                {isOwner ? (
                  <>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-500/10 text-red-400 transition-colors text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" /> Delete post
                    </button>
                    <div className="border-t border-white/[0.06]" />
                    <Link
                      href={`/post/${post.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#0f1520]/[0.05] text-white/60 transition-colors text-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-purple-400" /> View post
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleReport}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-500/10 text-red-400 transition-colors text-sm font-semibold"
                    >
                      <Flag className="w-4 h-4" /> Report
                    </button>
                    <div className="border-t border-white/[0.06]" />
                    <Link
                      href={`/profile/${post.user.username}`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#0f1520]/[0.05] text-white/60 transition-colors text-sm"
                    >
                      <UserPlus className="w-4 h-4 text-purple-400" /> Follow @{post.user.username}
                    </Link>
                    <div className="border-t border-white/[0.06]" />
                    <button
                      onClick={() => { navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`); setMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#0f1520]/[0.05] text-white/60 transition-colors text-sm"
                    >
                      <Share2 className="w-4 h-4 text-purple-400" /> Copy link
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative aspect-square bg-white/[0.03] cursor-pointer" onDoubleClick={handleDoubleTap}>
          <Image
            src={post.images[imgIdx]?.url}
            alt={post.caption ?? "Food photo"}
            fill
            className="object-cover"
          />
          {doubleTapHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg animate-ping" />
            </div>
          )}
          {post.images.length > 1 && (
            <>
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                {imgIdx + 1}/{post.images.length}
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`transition-all rounded-full ${i === imgIdx ? "w-4 h-1.5 bg-[#0f1520]" : "w-1.5 h-1.5 bg-[#0f1520]/60"}`}
                  />
                ))}
              </div>
              {imgIdx > 0 && (
                <button
                  onClick={() => setImgIdx((i) => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm text-lg font-bold"
                >
                  ‹
                </button>
              )}
              {imgIdx < post.images.length - 1 && (
                <button
                  onClick={() => setImgIdx((i) => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm text-lg font-bold"
                >
                  ›
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <button
              onClick={toggleLike}
              className={`p-2 rounded-full transition-all active:scale-90 ${liked ? "text-pink-500" : "text-white/40 hover:text-pink-400"}`}
            >
              <Heart className={`w-6 h-6 transition-all ${liked ? "fill-current scale-110" : ""}`} />
            </button>
            <Link href={`/post/${post.id}`} className="p-2 rounded-full text-white/40 hover:text-white/70 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </Link>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.origin + `/post/${post.id}`); }}
              className="p-2 rounded-full text-white/40 hover:text-white/70 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
            {recipe && (
              <button
                onClick={() => setShowRecipe(!showRecipe)}
                className={`p-2 rounded-full transition-colors ${showRecipe ? "text-purple-400" : "text-white/40 hover:text-purple-400"}`}
              >
                <ChefHat className="w-6 h-6" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-full transition-colors ${saved ? "text-purple-400" : "text-white/40 hover:text-purple-400"}`}
          >
            <Bookmark className={`w-6 h-6 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>

        <p className="text-sm font-bold text-white">{likeCount.toLocaleString()} likes</p>

        {post.caption && (
          <p className="text-sm text-white/70 leading-snug">
            <Link href={`/profile/${post.user.username}`} className="font-bold text-white mr-1 hover:text-purple-400">
              {post.user.name || post.user.username}
            </Link>
            {post.caption.split(" ").map((word, i) =>
              word.startsWith("#") ? (
                <span key={i} className="text-[#db2777] font-medium">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </p>
        )}

        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <p className="text-xs text-white/40 flex flex-wrap gap-1 items-center">
            <span>with</span>
            {post.taggedUsers.map((t) => (
              <Link key={t.user.id} href={`/profile/${t.user.username}`} className="text-purple-400 font-semibold hover:text-pink-400">
                @{t.user.username}
              </Link>
            ))}
          </p>
        )}

        {post._count.comments > 0 && (
          <Link href={`/post/${post.id}`} className="text-sm text-white/30 hover:text-white/60 transition-colors block">
            View all {post._count.comments} comments
          </Link>
        )}

        {comments.map((c) => (
          <p key={c.id} className="text-sm">
            <span className="font-bold text-white mr-1">{c.user.username}</span>
            <span className="text-white/60">{c.text}</span>
          </p>
        ))}

        <p className="text-xs text-white/20 uppercase tracking-wide">{formatRelativeTime(post.createdAt)}</p>

        {showRecipe && recipe && (
          <div className="mt-1 p-4 rounded-2xl border border-purple-500/20 space-y-3" style={{background:"rgba(168,85,247,0.08)"}}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-brand rounded-xl flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-white">{recipe.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {recipe.prepTime && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 font-medium text-white/60" style={{background:"rgba(255,255,255,0.05)"}}>
                  <Clock className="w-3 h-3 text-pink-400" /> Prep {recipe.prepTime}m
                </span>
              )}
              {recipe.cookTime && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 font-medium text-white/60" style={{background:"rgba(255,255,255,0.05)"}}>
                  <Clock className="w-3 h-3 text-orange-400" /> Cook {recipe.cookTime}m
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/10 font-medium text-white/60" style={{background:"rgba(255,255,255,0.05)"}}>
                  <Users className="w-3 h-3 text-purple-400" /> {recipe.servings} servings
                </span>
              )}
              {recipe.difficulty && (
                <span className="px-2.5 py-1 rounded-full font-semibold capitalize text-purple-300" style={{background:"rgba(168,85,247,0.15)"}}>{recipe.difficulty}</span>
              )}
            </div>
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Ingredients</p>
                <ul className="space-y-1">
                  {(recipe.ingredients as string[]).map((ing: string, i: number) => (
                    <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" /> {ing}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
              <div>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Steps</p>
                <ol className="space-y-2">
                  {(recipe.steps as string[]).map((step: string, i: number) => (
                    <li key={i} className="text-sm text-white/60 flex gap-3">
                      <span className="w-5 h-5 bg-gradient-brand text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
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

        {user && (
          <form onSubmit={submitComment} className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <Avatar src={user.avatar} alt={user.username} size="xs" />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none text-white/70 placeholder:text-white/20 bg-transparent"
            />
            {comment && (
              <button type="submit" className="text-sm font-bold text-purple-400 hover:text-pink-400">
                Post
              </button>
            )}
          </form>
        )}
      </div>
    </article>
  );
}
