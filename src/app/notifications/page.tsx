"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";

interface NotifItem {
  id: string;
  type: "like" | "follow" | "comment";
  user: { username: string; avatar: string | null };
  postId: string | null;
  postImage: string | null;
  text?: string;
  createdAt: string;
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const icons = {
  like: <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />,
  comment: <MessageCircle className="w-3.5 h-3.5 fill-purple-400 text-purple-400" />,
  follow: <UserPlus className="w-3.5 h-3.5 text-purple-400" />,
};

const messages: Record<string, string> = {
  like: "liked your post",
  follow: "started following you",
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { setItems(d.items ?? []); setLoading(false); });
    localStorage.setItem("notif_seen", new Date().toISOString());
  }, []);

  return (
    <div className="max-w-lg mx-auto px-0 pb-20 md:pb-0">
      <div className="px-4 py-5 text-center border-b border-white/[0.06]">
        <h1 className="text-lg font-bold text-white">Activity</h1>
      </div>

      {loading && (
        <div className="divide-y divide-white/[0.04]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full shrink-0" style={{background:"rgba(255,255,255,0.06)"}} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded w-3/4" style={{background:"rgba(255,255,255,0.06)"}} />
                <div className="h-2.5 rounded w-1/3" style={{background:"rgba(255,255,255,0.04)"}} />
              </div>
              <div className="w-10 h-10 rounded-lg shrink-0" style={{background:"rgba(255,255,255,0.06)"}} />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="py-32 text-center">
          <Bell className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p className="text-white/30 text-sm">No activity yet</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="divide-y divide-white/[0.04]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#0f1520]/[0.03]">
              <div className="relative shrink-0">
                <Avatar src={item.user.avatar} alt={item.user.username} size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{background:"#0f1520", border:"0.5px solid rgba(255,255,255,0.08)"}}>
                  {icons[item.type]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 leading-snug">
                  <Link href={`/profile/${item.user.username}`} className="font-bold text-white hover:text-purple-400 transition-colors">
                    {item.user.username}
                  </Link>{" "}
                  <span className="text-white/50">
                    {item.type === "comment" && item.text
                      ? `commented: "${item.text}"`
                      : messages[item.type]}
                  </span>
                </p>
                <p className="text-xs text-white/25 mt-0.5">{timeAgo(item.createdAt)}</p>
              </div>

              {item.postId && item.postImage && (
                <Link href={`/post/${item.postId}`} className="shrink-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                    <Image src={item.postImage} alt="" fill className="object-cover" />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
