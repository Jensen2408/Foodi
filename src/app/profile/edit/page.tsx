"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, ChefHat, Globe, FileText, User, ArrowLeft, AtSign } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";

export default function EditProfilePage() {
  const { user, mutate } = useUser();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setBio(user.bio ?? "");
      setWebsite(user.website ?? "");
      setUsername(user.username ?? "");
      setAvatarPreview(user.avatar ?? null);
    }
  }, [user]);

  if (!user) return null;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let avatarUrl = user!.avatar;

    if (avatarFile) {
      const fd = new FormData();
      fd.append("file", avatarFile);
      fd.append("folder", "avatars");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Failed to upload photo");
        setSaving(false);
        return;
      }
      avatarUrl = data.url;
    }

    const res = await fetch(`/api/users/${user!.username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, website, avatar: avatarUrl, username }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    const newUsername = data.username ?? user!.username;
    mutate({ ...user!, name: data.name, bio: data.bio, website: data.website, avatar: data.avatar, username: newUsername });
    router.push(`/profile/${newUsername}`);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/profile/${user.username}`} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Edit profile</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {avatarPreview ? (
                <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#f8f6f3] shadow-md hover:opacity-90 transition-opacity bg-gradient-brand"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm font-semibold text-purple-400 hover:text-pink-400 transition-colors"
          >
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {/* Fields */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <User className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-0.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 px-4 py-3.5">
            <FileText className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-0.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                rows={3}
                maxLength={150}
                className="w-full text-sm text-gray-900 outline-none bg-transparent resize-none placeholder:text-gray-300"
              />
              <p className="text-xs text-gray-300 text-right">{bio.length}/150</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3.5">
            <Globe className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-0.5">Website</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                type="url"
                className="w-full text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <AtSign className="w-5 h-5 text-gray-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-400 mb-0.5">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                placeholder="username"
                className="w-full text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-gradient-brand text-white font-bold rounded-2xl shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60 text-sm"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
