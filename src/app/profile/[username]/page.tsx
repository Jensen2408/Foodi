"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Grid3x3, BookOpen, Heart, MessageCircle, Globe, LogOut, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { FollowListModal } from "@/components/profile/FollowListModal";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tab, setTab] = useState<"posts" | "recipes" | "liked">("posts");
  const [following, setFollowing] = useState(false);
  const [modal, setModal] = useState<"followers" | "following" | null>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  }

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
        {[0,1,2].map((i) => <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
      </div>
    </div>
  );

  const isMe = me?.id === profile.id;

  return (
    <div className="max-w-[470px] md:max-w-3xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="flex items-start gap-6 mb-6">
        {/* Avatar with pink ring */}
<div className="shrink-0 w-20 h-20 rounded-full p-0.5" style={{background:"linear-gradient(135deg, #db2777, #a855f7)"}}>
  <div className="w-full h-full rounded-full overflow-hidden bg-white">
    {profile.avatar ? (
      <Image src={profile.avatar} alt={profile.username} width={80} height={80} className="w-full h-full object-cover rounded-full" />
    ) : (
      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl">
        {profile.username[0].toUpperCase()}
      </div>
    )}
  </div>
</div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <h1 className="text-lg font-bold text-gray-900">{profile.name || profile.username}</h1>
            {isMe ? (
              <>
                <Link href="/profile/edit" className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Settings className="w-3 h-3" /> Edit
                </Link>
                <button onClick={handleLogout} className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            ) : me ? (
              <Button variant={following ? "secondary" : "default"} size="sm" onClick={toggleFollow}>
                {following ? "Following" : "Follow"}
              </Button>
            ) : null}
          </div>

          {profile.bio && <p className="text-sm text-gray-500 mb-2 leading-relaxed">{profile.bio}</p>}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm text-purple-400 flex items-center gap-1 hover:underline">
              <Globe className="w-3 h-3" /> {profile.website.replace(/https?:\/\//, "")}
            </a>
          )}

          {/* Stats */}
          <div className="flex gap-6 mt-3">
            <div className="text-center">
              <p className="font-bold text-gray-900">{profile._count.posts}</p>
              <p className="text-xs text-gray-400">posts</p>
            </div>
            <button onClick={() => setModal("followers")} className="text-center hover:opacity-70 transition-opacity">
              <p className="font-bold text-gray-900">{profile._count.followers}</p>
              <p className="text-xs text-gray-400">followers</p>
            </button>
            <button onClick={() => setModal("following")} className="text-center hover:opacity-70 transition-opacity">
              <p className="font-bold text-gray-900">{profile._count.following}</p>
              <p className="text-xs text-gray-400">following</p>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-3">
        {([
          { key: "posts", icon: Grid3x3, label: "Posts" },
          { key: "recipes", icon: BookOpen, label: "Recipes" },
          { key: "liked", icon: Heart, label: "Liked" },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === key ? "border-[#db2777] text-gray-900" : "border-transparent text-gray-400 hover:text-gray-500"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
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

      {/* Liked tab */}
      {tab === "liked" && (
        <div className="py-20 text-center text-gray-400">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Liked posts will appear here</p>
        </div>
      )}

      {/* Recipes grid */}
      {tab === "recipes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              {recipe.coverImage ? (
                <div className="relative aspect-video overflow-hidden">
                  <Image src={recipe.coverImage} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center" style={{background:"rgba(168,85,247,0.08)"}}>
                  <BookOpen className="w-10 h-10 text-purple-400/50" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{recipe.title}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {recipe.difficulty && (
                    <span className="text-xs bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full capitalize">{recipe.difficulty}</span>
                  )}
                  {recipe.prepTime && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Prep {recipe.prepTime}m</span>
                  )}
                  {recipe.cookTime && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Cook {recipe.cookTime}m</span>
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
                <Link href="/recipes/new" className="mt-3 inline-block text-sm text-purple-400 font-semibold hover:underline">
                  Add your first recipe →
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {modal && (
        <FollowListModal
          userId={profile.id}
          type={modal}
          title={modal === "followers" ? "Followers" : "Following"}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
