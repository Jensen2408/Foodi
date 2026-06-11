"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, MapPin, ChefHat, Clock, Users } from "lucide-react";
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

export function PostCard({ post: initial }: { post: Post }) {
  const { user } = useUser();
  const [post, setPost] = useState(initial);
  const [liked, setLiked] = useState((initial.likes?.length ?? 0) > 0);
  const [likeCount, setLikeCount] = useState(initial._count.likes);
  const [imgIdx, setImgIdx] = useState(0);
  const [showRecipe, setShowRecipe] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{ id: string; text: string; user: { username: string } }[]>([]);

  async function toggleLike() {
    if (!user) return;
    const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => c + (data.liked ? 1 : -1));
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
    <article className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm shadow-pink-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3 group">
          <Avatar src={post.user.avatar} alt={post.user.username} size="sm" />
          <div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
              {post.user.username}
            </p>
            {post.location && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {post.location}
              </p>
            )}
          </div>
        </Link>
        <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="relative aspect-square bg-gray-50">
          <Image
            src={post.images[imgIdx]?.url}
            alt={post.caption ?? "Food photo"}
            fill
            className="object-cover"
          />
          {post.images.length > 1 && (
            <>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white scale-125" : "bg-white/60"}`}
                  />
                ))}
              </div>
              {imgIdx > 0 && (
                <button
                  onClick={() => setImgIdx((i) => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
                >
                  ‹
                </button>
              )}
              {imgIdx < post.images.length - 1 && (
                <button
                  onClick={() => setImgIdx((i) => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm"
                >
                  ›
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={toggleLike}
              className={`p-2 rounded-xl transition-all ${liked ? "text-red-500 scale-110" : "text-gray-500 hover:text-red-400 hover:scale-105"}`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            </button>
            <Link href={`/post/${post.id}`} className="p-2 rounded-xl text-gray-500 hover:text-pink-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </Link>
            {recipe && (
              <button
                onClick={() => setShowRecipe(!showRecipe)}
                className={`p-2 rounded-xl transition-colors ${showRecipe ? "text-pink-600" : "text-gray-500 hover:text-pink-600"}`}
              >
                <ChefHat className="w-5 h-5" />
              </button>
            )}
          </div>
          <button className="p-2 rounded-xl text-gray-500 hover:text-pink-600 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm font-semibold text-gray-900">{likeCount.toLocaleString()} likes</p>

        {post.caption && (
          <p className="text-sm text-gray-800">
            <Link href={`/profile/${post.user.username}`} className="font-semibold mr-1 hover:text-pink-600">
              {post.user.username}
            </Link>
            {post.caption}
          </p>
        )}

        {post._count.comments > 0 && (
          <Link href={`/post/${post.id}`} className="text-sm text-gray-400 hover:text-gray-600 transition-colors block">
            View all {post._count.comments} comments
          </Link>
        )}

        {comments.map((c) => (
          <p key={c.id} className="text-sm">
            <span className="font-semibold mr-1">{c.user.username}</span>{c.text}
          </p>
        ))}

        {post.taggedUsers && post.taggedUsers.length > 0 && (
          <p className="text-xs text-gray-500 flex flex-wrap gap-1 items-center">
            <span className="text-gray-400">with</span>
            {post.taggedUsers.map((t) => (
              <Link key={t.user.id} href={`/profile/${t.user.username}`} className="text-pink-500 font-semibold hover:text-pink-600">
                @{t.user.username}
              </Link>
            ))}
          </p>
        )}
        <p className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</p>

        {/* Recipe Card */}
        {showRecipe && recipe && (
          <div className="mt-2 p-4 bg-gradient-to-br from-pink-50 to-fuchsia-50 rounded-2xl border border-pink-100 space-y-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-pink-500" />
              <h3 className="font-bold text-gray-900">{recipe.title}</h3>
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              {recipe.prepTime && (
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                  <Clock className="w-3 h-3 text-pink-500" /> Prep: {recipe.prepTime}m
                </span>
              )}
              {recipe.cookTime && (
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                  <Clock className="w-3 h-3 text-pink-500" /> Cook: {recipe.cookTime}m
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-sm">
                  <Users className="w-3 h-3 text-purple-500" /> {recipe.servings} servings
                </span>
              )}
              {recipe.difficulty && (
                <span className="bg-white px-2 py-1 rounded-full shadow-sm capitalize">{recipe.difficulty}</span>
              )}
            </div>

            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Ingredients</p>
                <ul className="space-y-0.5">
                  {(recipe.ingredients as string[]).map((ing: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="text-brand-400 mt-0.5">•</span> {ing}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Steps</p>
                <ol className="space-y-1">
                  {(recipe.steps as string[]).map((step: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                      <span className="w-4 h-4 bg-pink-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
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
          <form onSubmit={submitComment} className="flex gap-2 pt-1 border-t border-gray-50">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
            />
            {comment && (
              <button type="submit" className="text-sm font-semibold text-pink-600 hover:text-brand-700">
                Post
              </button>
            )}
          </form>
        )}
      </div>
    </article>
  );
}
