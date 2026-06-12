"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Grid3x3, BookOpen, Heart, MessageCircle, Globe, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

interface Profile {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  _count: { posts: number; followers: number; following: number; recipes: number };
  isFollowing: boolean;
}

interface PostPreview {
  id: string;
  images: { url: string }[];
  _count: { likes: number; comments: number };
}

interface Recipe {
  id: string;
  title: string;
  coverImage: string | null;
  difficulty: string | null;
  prepTime: number | null;
  cookTime: number | null;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tab, setTab] = useState<"posts" | "recipes">("posts");
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then((r) => r.json())
      .then((d) => { setProfile(d); setFollowing(d.isFollowing); });
    fetch(`/api/users/${username}/posts`)
      .then((r) => r.json())
      .then(setPosts);
  }, [username]);

  useEffect(() => {
    if (tab === "recipes" && profile) {
      fetch(`/api/recipes?userId=${profile.id}`)
        .then((r) => r.json())
        .then(setRecipes);
    }
  }, [tab, profile]);

  async function toggleFollow() {
    if (!profile) return;
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: profile.id }),
    });
    const d = await res.json();
    setFollowing(d.following);
    setProfile((p) => p ? {
      ...p,
      _count: { ...p._count, followers: p._count.followers + (d.following ? 1 : -1) }
    } : p);
  }

  if (!profile) return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center">
      <div className="flex gap-1">
        {[0,1,2].map((i) => <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
      </div>
    </div>
  );

  const isMe = me?.id === profile.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-6">
          <Avatar src={profile.avatar} alt={profile.username} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-black text-gray-900">{profile.username}</h1>
              {isMe ? (
                <Link href="/profile/edit">
                  <Button variant="secondary" size="sm">Edit profile</Button>
                </Link>
              ) : me ? (
                <Button
                  variant={following ? "secondary" : "default"}
                  size="sm"
                  onClick={toggleFollow}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              ) : null}
            </div>
            {profile.name && <p className="text-gray-700 font-medium mt-1">{profile.name}</p>}
            {profile.bio && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{profile.bio}</p>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer"
                className="text-sm text-brand-600 flex items-center gap-1 mt-1 hover:underline">
                <Globe className="w-3 h-3" /> {profile.website.replace(/https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: "Posts", value: profile._count.posts },
            { label: "Followers", value: profile._count.followers },
            { label: "Following", value: profile._count.following },
            { label: "Recipes", value: profile._count.recipes },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xl font-black text-gray-900">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl border border-gray-100 shadow-sm p-1 mb-6">
        <button
          onClick={() => setTab("posts")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === "posts" ? "bg-gradient-brand text-white shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Grid3x3 className="w-4 h-4" /> Posts
        </button>
        <button
          onClick={() => setTab("recipes")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === "recipes" ? "bg-gradient-brand text-white shadow" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Recipes
        </button>
      </div>

      {/* Posts grid */}
      {tab === "posts" && (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="group relative aspect-square overflow-hidden rounded-xl">
              {post.images[0] ? (
                <Image src={post.images[0].url} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                <span className="flex items-center gap-1 text-white text-sm font-bold">
                  <Heart className="w-4 h-4 fill-current" /> {post._count.likes}
                </span>
                <span className="flex items-center gap-1 text-white text-sm font-bold">
                  <MessageCircle className="w-4 h-4 fill-current" /> {post._count.comments}
                </span>
              </div>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="col-span-3 py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📸</p>
              <p>No posts yet</p>
            </div>
          )}
        </div>
      )}

      {/* Recipes grid */}
      {tab === "recipes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              {recipe.coverImage ? (
                <div className="relative aspect-video overflow-hidden">
                  <Image src={recipe.coverImage} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-brand-100 to-pink-100 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-brand-300" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{recipe.title}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {recipe.difficulty && (
                    <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full capitalize">{recipe.difficulty}</span>
                  )}
                  {recipe.prepTime && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Prep {recipe.prepTime}m</span>
                  )}
                  {recipe.cookTime && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Cook {recipe.cookTime}m</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {recipes.length === 0 && (
            <div className="col-span-2 py-16 text-center text-gray-400">
              <p className="text-4xl mb-2">📖</p>
              <p>No public recipes yet</p>
              {isMe && (
                <Link href="/recipes/new" className="mt-3 inline-block text-sm text-brand-600 font-semibold hover:underline">
                  Add your first recipe →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
