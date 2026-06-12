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
    <article className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-pink-400 to-fuchsia-400">
            <div className="bg-white p-0.5 rounded-full">
              <Avatar src={post.user.avatar} alt={post.user.username} size="sm" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 group-hover:text-pink-600 transition-colors leading-tight">
              {post.user.name || post.user.username}
            </p>
            {post.location ? (
              <p className="text-xs text-pink-400 flex items-center gap-0.5 leading-tight">
                <MapPin className="w-2.5 h-2.5" /> {post.location}
              </p>
            ) : (
              <p className="text-xs text-gray-400 leading-tight">@{post.user.username}</p>
            )}
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-pink-50 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden z-50 animate-slide-up">
              {isOwner ? (
                <>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 text-red-500 transition-colors text-sm font-semibold"
                  >
                    <Trash2 className="w-4 h-4" /> Delete post
                  </button>
                  <div className="border-t border-pink-50" />
                  <Link
                    href={`/post/${post.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-pink-50 text-gray-700 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-pink-400" /> View post
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={handleReport}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 text-red-500 transition-colors text-sm font-semibold"
                  >
                    <Flag className="w-4 h-4" /> Report
                  </button>
                  <div className="border-t border-pink-50" />
                  <Link
                    href={`/profile/${post.user.username}`}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-pink-50 text-gray-700 transition-colors text-sm"
                  >
                    <UserPlus className="w-4 h-4 text-pink-400" /> Follow @{post.user.username}
                  </Link>
                  <div className="border-t border-pink-50" />
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-pink-50 text-gray-700 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4 text-pink-400" /> Copy link
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative aspect-square bg-gray-50 cursor-pointer" onDoubleClick={handleDoubleTap}>
          <Image
            src={post.images[imgIdx]?.url}
            alt={post.caption ?? "Food photo"}
            fill
            className="object-cover"
          />
          {/* Double tap heart */}
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
                    className={`transition-all rounded-full ${i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"}`}
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
              className={`p-2 rounded-full transition-all active:scale-90 ${liked ? "text-red-500" : "text-gray-700 hover:text-red-400"}`}
            >
              <Heart className={`w-6 h-6 transition-all ${liked ? "fill-current scale-110" : ""}`} />
            </button>
            <Link href={`/post/${post.id}`} className="p-2 rounded-full text-gray-700 hover:text-pink-600 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </Link>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.origin + `/post/${post.id}`); }}
              className="p-2 rounded-full text-gray-700 hover:text-pink-600 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>
            {recipe && (
              <button
                onClick={() => setShowRecipe(!showRecipe)}
                className={`p-2 rounded-full transition-colors ${showRecipe ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}
              >
                <ChefHat className="w-6 h-6" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-full transition-colors ${saved ? "text-pink-600" : "text-gray-700 hover:text-pink-600"}`}
          >
            <Bookmark className={`w-6 h-6 ${saved ? "fill-current" : ""}`} />
          </button>
        </div>

        <p className="text-sm font-bold text-gray-900">{likeCount.toLocaleString()} likes</p>

        {post.caption && (
          <p className="text-sm text-gray-800 leading-snug">
            <Link href={`/profile/${post.user.username}`} className="font-bold mr-1 hover:text-pink-600">
              {post.user.name || post.user.username}
            </Link>
            {post.caption}
          </p>
        )}

        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <p className="text-xs text-gray-500 flex flex-wrap gap-1 items-center">
            <span className="text-gray-400">with</span>
            {post.taggedUsers.map((t) => (
              <Link key={t.user.id} href={`/profile/${t.user.username}`} className="text-pink-500 font-semibold hover:text-pink-700">
                @{t.user.username}
              </Link>
            ))}
          </p>
        )}

        {post._count.comments > 0 && (
          <Link href={`/post/${post.id}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors block">
            View all {post._count.comments} comments
          </Link>
        )}

        {comments.map((c) => (
          <p key={c.id} className="text-sm">
            <span className="font-bold mr-1">{c.user.username}</span>
            <span className="text-gray-700">{c.text}</span>
          </p>
        ))}

        <p className="text-xs text-gray-400 uppercase tracking-wide">{formatRelativeTime(post.createdAt)}</p>

        {/* Recipe Card */}
        {showRecipe && recipe && (
          <div className="mt-1 p-4 bg-gradient-to-br from-pink-50 to-fuchsia-50 rounded-2xl border border-pink-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-fuchsia-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">{recipe.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {recipe.prepTime && (
                <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm border border-pink-100 font-medium">
                  <Clock className="w-3 h-3 text-pink-500" /> Prep {recipe.prepTime}m
                </span>
              )}
              {recipe.cookTime && (
                <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm border border-pink-100 font-medium">
                  <Clock className="w-3 h-3 text-orange-400" /> Cook {recipe.cookTime}m
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full shadow-sm border border-pink-100 font-medium">
                  <Users className="w-3 h-3 text-purple-500" /> {recipe.servings} servings
                </span>
              )}
              {recipe.difficulty && (
                <span className="bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full font-semibold capitalize">{recipe.difficulty}</span>
              )}
            </div>
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Ingredients</p>
                <ul className="space-y-1">
                  {(recipe.ingredients as string[]).map((ing: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" /> {ing}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Steps</p>
                <ol className="space-y-2">
                  {(recipe.steps as string[]).map((step: string, i: number) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-3">
                      <span className="w-5 h-5 bg-gradient-to-br from-pink-400 to-fuchsia-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
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

        {/* Comment input */}
        {user && (
          <form onSubmit={submitComment} className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Avatar src={user.avatar} alt={user.username} size="xs" />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
            />
            {comment && (
              <button type="submit" className="text-sm font-bold text-pink-500 hover:text-pink-700">
                Post
              </button>
            )}
          </form>
        )}
      </div>
    </article>
  );
}
