"use client";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Link from "next/link";
import { StoryViewer } from "./StoryViewer";

interface StoryGroup {
  user: { id: string; username: string; avatar: string | null };
  stories: { id: string; imageUrl: string; caption: string | null; createdAt: string }[];
  hasNew: boolean;
}

export function StoryBar() {
  const { user } = useUser();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [viewing, setViewing] = useState<StoryGroup | null>(null);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then(setGroups);
  }, []);

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm shadow-pink-100 p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {user && (
            <Link href="/stories/new" className="flex flex-col items-center gap-1.5 group">
              <div className="relative">
                <Avatar src={user.avatar} alt={user.username} size="lg" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-gradient-brand rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium max-w-[56px] truncate">
                Your story
              </span>
            </Link>
          )}

          {groups.map((group) => (
            <button
              key={group.user.id}
              onClick={() => setViewing(group)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <Avatar
                src={group.user.avatar}
                alt={group.user.username}
                size="lg"
                hasStory={group.hasNew}
              />
              <span className="text-xs text-gray-600 font-medium max-w-[56px] truncate">
                {group.user.username}
              </span>
            </button>
          ))}

          {groups.length === 0 && !user && (
            <p className="text-sm text-gray-400 py-4 px-2">No stories yet</p>
          )}
        </div>
      </div>

      {viewing && (
        <StoryViewer group={viewing} onClose={() => setViewing(null)} />
      )}
    </>
  );
}
