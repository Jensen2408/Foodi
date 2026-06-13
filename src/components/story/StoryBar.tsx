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
    fetch("/api/stories").then((r) => r.json()).then(setGroups);
  }, []);

  return (
    <>
      <div className="border-b border-white/[0.06] px-2 py-3 overflow-x-auto scrollbar-none" style={{background:"rgba(255,255,255,0.02)"}}>
        <div className="flex gap-3 px-2 min-w-max">
          {user && (
            <Link href="/stories/new" className="flex flex-col items-center gap-1 w-[66px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/50 text-xl font-bold" style={{background:"rgba(255,255,255,0.05)"}}>
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-brand rounded-full flex items-center justify-center border-2 border-[#080c14]">
                  <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </div>
              <span className="text-[11px] text-white/40 truncate w-full text-center leading-tight">Your story</span>
            </Link>
          )}

          {groups.map((group) => (
            <button key={group.user.id} onClick={() => setViewing(group)} className="flex flex-col items-center gap-1 w-[66px]">
              <div className={`w-16 h-16 rounded-full p-[2px] ${group.hasNew ? "bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400" : "bg-white/10"}`}>
                <div className="w-full h-full rounded-full border-[3px] border-[#080c14] overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
                  <Avatar src={group.user.avatar} alt={group.user.username} size="lg" />
                </div>
              </div>
              <span className="text-[11px] text-white/40 truncate w-full text-center leading-tight">{group.user.username}</span>
            </button>
          ))}

          {groups.length === 0 && !user && (
            <p className="text-sm text-white/30 py-4 px-2">No stories yet</p>
          )}
        </div>
      </div>

      {viewing && <StoryViewer group={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
