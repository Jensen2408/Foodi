"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

interface FUser {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface Props {
  userId: string;
  type: "followers" | "following";
  title: string;
  onClose: () => void;
}

export function FollowListModal({ userId, type, title, onClose }: Props) {
  const [users, setUsers] = useState<FUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/follow?userId=${userId}&type=${type}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d); setLoading(false); });
  }, [userId, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="w-8" />
          <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="flex gap-1">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-[#d4347a] rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">👥</p>
              <p className="text-sm">No {type} yet</p>
            </div>
          ) : (
            users.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.username}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {u.avatar ? (
                    <Image src={u.avatar} alt={u.username} width={44} height={44} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
                      {u.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.username}</p>
                  {u.name && <p className="text-xs text-gray-400 truncate">{u.name}</p>}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
