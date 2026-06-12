"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus } from "lucide-react";

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
  like: <Heart className="w-3.5 h-3.5 fill-[#c6185c] text-[#c6185c]" />,
  comment: <MessageCircle className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />,
  follow: <UserPlus className="w-3.5 h-3.5 text-green-500" />,
};

const messages = {
  like: "liked your post",
  comment: (text: string) => `commented: "${text}"`,
  follow: "started following you",
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { setItems(d.items ?? []); setLoading(false); });
  }, []);

  return (
    <div className="max-w-lg mx-auto px-0 pb-20 md:pb-0">
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100">
        <h1 className="text-lg font-black text-gray-900">Notifications</h1>
      </div>

      {loading && (
        <div className="divide-y divide-gray-50">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="py-24 text-center text-gray-400">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">When someone likes or follows you, it shows here</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="relative shrink-0">
                <Avatar src={item.user.avatar} alt={item.user.username} size="md" />
                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {icons[item.type]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 leading-snug">
                  <Link href={`/profile/${item.user.username}`} className="font-bold hover:underline">
                    {item.user.username}
                  </Link>{" "}
                  <span className="text-gray-600">
                    {item.type === "comment" && item.text
                      ? messages.comment(item.text)
                      : messages[item.type]}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.createdAt)}</p>
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
