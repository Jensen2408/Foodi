"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Users, ImageIcon, BookOpen, MessageCircle, Heart, Trash2, Shield, ShieldOff, BarChart3, Film } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface Stats { users: number; posts: number; recipes: number; comments: number; likes: number; stories: number; }
interface AdminUser {
  id: string; username: string; name: string | null; email: string; avatar: string | null;
  isAdmin: boolean; createdAt: string;
  _count: { posts: number; followers: number; following: number };
}
interface AdminPost {
  id: string; caption: string | null; createdAt: string;
  user: { id: string; username: string; avatar: string | null };
  images: { url: string }[];
  _count: { likes: number; comments: number };
}

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<"stats" | "users" | "posts">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    fetch("/api/admin/stats").then(r => r.json()).then(setStats);
    fetch("/api/admin/users").then(r => r.json()).then(setUsers);
    fetch("/api/admin/posts").then(r => r.json()).then(setPosts);
  }, [user]);

  async function deleteUser(id: string, username: string) {
    if (!confirm(`Delete user @${username}? This cannot be undone.`)) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  async function toggleAdmin(id: string, isAdmin: boolean) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isAdmin: !isAdmin }) });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isAdmin: !isAdmin } : u));
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch("/api/admin/posts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  if (loading || !user?.isAdmin) return null;

  const statCards = stats ? [
    { label: "Users", value: stats.users, icon: Users, color: "bg-blue-600" },
    { label: "Posts", value: stats.posts, icon: ImageIcon, color: "bg-fuchsia-500" },
    { label: "Recipes", value: stats.recipes, icon: BookOpen, color: "bg-rose-500" },
    { label: "Comments", value: stats.comments, icon: MessageCircle, color: "bg-blue-500" },
    { label: "Likes", value: stats.likes, icon: Heart, color: "bg-red-400" },
    { label: "Stories", value: stats.stories, icon: Film, color: "bg-purple-500" },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-pink-900">Admin Console</h1>
          <p className="text-blue-500 mt-1">Manage FoodGram</p>
        </div>
        <span className="flex items-center gap-2 bg-blue-100 text-blue-800 font-semibold text-sm px-4 py-2 rounded-full">
          <Shield className="w-4 h-4" /> Admin
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-blue-50 p-1 rounded-2xl w-fit">
        {([["stats", "Stats", BarChart3], ["users", "Users", Users], ["posts", "Posts", ImageIcon]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === key ? "bg-white shadow text-blue-800" : "text-blue-500 hover:text-blue-700"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-sm p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{value.toLocaleString()}</p>
                <p className="text-sm text-blue-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-50">
            <p className="font-bold text-pink-900">{users.length} users</p>
          </div>
          <div className="divide-y divide-pink-50">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/50 transition-colors">
                <Avatar src={u.avatar} alt={u.username} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${u.username}`} className="font-semibold text-gray-900 hover:text-blue-700">@{u.username}</Link>
                    {u.isAdmin && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>}
                  </div>
                  <p className="text-sm text-blue-500 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{u._count.posts} posts · {u._count.followers} followers · joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAdmin(u.id, u.isAdmin)}
                    title={u.isAdmin ? "Remove admin" : "Make admin"}
                    className={`p-2 rounded-xl transition-colors ${u.isAdmin ? "text-blue-600 hover:bg-blue-100" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    {u.isAdmin ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  </button>
                  {u.id !== user.id && (
                    <button onClick={() => deleteUser(u.id, u.username)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts tab */}
      {tab === "posts" && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-50">
            <p className="font-bold text-pink-900">{posts.length} posts</p>
          </div>
          <div className="divide-y divide-pink-50">
            {posts.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-blue-50/50 transition-colors">
                {p.images[0] ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                    <Image src={p.images[0].url} alt="" width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${p.user.username}`} className="text-sm font-semibold text-blue-700">@{p.user.username}</Link>
                    <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700 truncate mt-0.5">{p.caption || "No caption"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p._count.likes} likes · {p._count.comments} comments</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/post/${p.id}`} className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs font-medium">
                    View
                  </Link>
                  <button onClick={() => deletePost(p.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
