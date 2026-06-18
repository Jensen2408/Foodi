"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { Users, ImageIcon, BookOpen, MessageCircle, Heart, Trash2, Shield, ShieldOff, BarChart3, Film, Pencil, Check, X } from "lucide-react";
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
interface AdminRecipe {
  id: string; title: string; coverImage: string | null; difficulty: string | null; createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [tab, setTab] = useState<"stats" | "users" | "posts" | "recipes">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    fetch("/api/admin/stats").then(r => r.json()).then(setStats);
    fetch("/api/admin/users").then(r => r.json()).then(setUsers);
    fetch("/api/admin/posts").then(r => r.json()).then(setPosts);
    fetch("/api/admin/recipes").then(r => r.json()).then(setRecipes);
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

  async function deleteRecipe(id: string) {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    await fetch("/api/admin/recipes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setRecipes(prev => prev.filter(r => r.id !== id));
  }

  function startEditUsername(u: AdminUser) {
    setEditingUserId(u.id);
    setEditingUsername(u.username);
    setUsernameError("");
  }

  function cancelEditUsername() {
    setEditingUserId(null);
    setEditingUsername("");
    setUsernameError("");
  }

  async function saveUsername(id: string) {
    setUsernameError("");
    const trimmed = editingUsername.trim();
    if (!trimmed) { setUsernameError("Username cannot be empty"); return; }
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, username: trimmed }),
    });
    if (!res.ok) {
      const data = await res.json();
      setUsernameError(data.error || "Failed to update");
      return;
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, username: trimmed } : u));
    setEditingUserId(null);
  }

  if (loading || !user?.isAdmin) return null;

  const statCards = stats ? [
    { label: "Users", value: stats.users, icon: Users, bg: "bg-pink-50", iconColor: "text-pink-500" },
    { label: "Posts", value: stats.posts, icon: ImageIcon, bg: "bg-purple-50", iconColor: "text-purple-500" },
    { label: "Recipes", value: stats.recipes, icon: BookOpen, bg: "bg-rose-50", iconColor: "text-rose-500" },
    { label: "Comments", value: stats.comments, icon: MessageCircle, bg: "bg-pink-50", iconColor: "text-pink-400" },
    { label: "Likes", value: stats.likes, icon: Heart, bg: "bg-red-50", iconColor: "text-red-400" },
    { label: "Stories", value: stats.stories, icon: Film, bg: "bg-purple-50", iconColor: "text-purple-400" },
  ] : [];

  const tabs = [
    ["stats", "Stats", BarChart3],
    ["users", "Users", Users],
    ["posts", "Posts", ImageIcon],
    ["recipes", "Recipes", BookOpen],
  ] as const;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Admin Console</h1>
          <p className="text-gray-500 mt-1">Manage FoodGram</p>
        </div>
        <span className="flex items-center gap-2 bg-pink-50 text-pink-600 font-semibold text-sm px-4 py-2 rounded-full">
          <Shield className="w-4 h-4" /> Admin
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
        {tabs.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(({ label, value, icon: Icon, bg, iconColor }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{value.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900">{users.length} users</p>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <Avatar src={u.avatar} alt={u.username} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {editingUserId === u.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editingUsername}
                          onChange={e => setEditingUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                          className="text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg px-2 py-1 outline-none focus:border-pink-400 w-40"
                          autoFocus
                          onKeyDown={e => { if (e.key === "Enter") saveUsername(u.id); if (e.key === "Escape") cancelEditUsername(); }}
                        />
                        <button onClick={() => saveUsername(u.id)} className="p-1 rounded text-green-600 hover:bg-green-50">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEditUsername} className="p-1 rounded text-gray-400 hover:bg-gray-100">
                          <X className="w-4 h-4" />
                        </button>
                        {usernameError && <span className="text-xs text-red-500">{usernameError}</span>}
                      </div>
                    ) : (
                      <>
                        <Link href={`/profile/${u.username}`} className="font-semibold text-gray-900 hover:text-pink-500">@{u.username}</Link>
                        <button onClick={() => startEditUsername(u)} title="Edit username" className="p-1 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {u.isAdmin && <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full font-semibold">Admin</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{u._count.posts} posts · {u._count.followers} followers · joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAdmin(u.id, u.isAdmin)}
                    title={u.isAdmin ? "Remove admin" : "Make admin"}
                    className={`p-2 rounded-xl transition-colors ${u.isAdmin ? "text-purple-500 hover:bg-purple-50" : "text-gray-300 hover:bg-gray-100"}`}
                  >
                    {u.isAdmin ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                  </button>
                  {u.id !== user.id && (
                    <button onClick={() => deleteUser(u.id, u.username)} className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
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
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900">{posts.length} posts</p>
          </div>
          <div className="divide-y divide-gray-100">
            {posts.map(p => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                {p.images[0] ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                    <Image src={p.images[0].url} alt="" width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${p.user.username}`} className="text-sm font-semibold text-gray-900 hover:text-pink-500">@{p.user.username}</Link>
                    <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{p.caption || "No caption"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p._count.likes} likes · {p._count.comments} comments</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/post/${p.id}`} className="px-3 py-1.5 rounded-xl text-gray-500 hover:text-purple-500 hover:bg-purple-50 transition-colors text-xs font-medium border border-gray-200">
                    View
                  </Link>
                  <button onClick={() => deletePost(p.id)} className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipes tab */}
      {tab === "recipes" && (
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="font-bold text-gray-900">{recipes.length} recipes</p>
          </div>
          <div className="divide-y divide-gray-100">
            {recipes.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                {r.coverImage ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                    <Image src={r.coverImage} alt="" width={56} height={56} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                    {r.difficulty && <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{r.difficulty}</span>}
                  </div>
                  <Link href={`/profile/${r.user.username}`} className="text-sm text-gray-500 hover:text-pink-500">@{r.user.username}</Link>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => deleteRecipe(r.id)} className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
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
