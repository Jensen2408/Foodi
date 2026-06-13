"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils";

interface Story {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
}

interface StoryGroup {
  user: { id: string; username: string; avatar: string | null };
  stories: Story[];
}

export function StoryViewer({ group, onClose }: { group: StoryGroup; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const story = group.stories[idx];

  const next = useCallback(() => {
    if (idx < group.stories.length - 1) {
      setIdx((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [idx, group.stories.length, onClose]);

  const prev = () => {
    if (idx > 0) { setIdx((i) => i - 1); setProgress(0); }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { next(); return 0; }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [idx, next]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative w-full max-w-sm h-[85vh] rounded-3xl overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-[#0f1520]/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0f1520] rounded-full transition-none"
                style={{ width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Avatar src={group.user.avatar} alt={group.user.username} size="sm" />
            <div>
              <p className="text-white text-sm font-semibold">{group.user.username}</p>
              <p className="text-white/70 text-xs">{formatRelativeTime(story.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <Image
          src={story.imageUrl}
          alt="Story"
          fill
          className="object-cover"
          priority
        />

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-8 left-4 right-4 z-10">
            <p className="text-white text-sm text-center drop-shadow-lg font-medium">
              {story.caption}
            </p>
          </div>
        )}

        {/* Nav zones */}
        <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
        <button onClick={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />

        {idx > 0 && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <ChevronLeft className="w-6 h-6 text-white/60" />
          </div>
        )}
        {idx < group.stories.length - 1 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <ChevronRight className="w-6 h-6 text-white/60" />
          </div>
        )}
      </div>
    </div>
  );
}
