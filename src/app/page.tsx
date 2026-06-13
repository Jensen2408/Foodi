import { StoryBar } from "@/components/story/StoryBar";
import { Feed } from "@/components/feed/Feed";
import { SuggestedUsers } from "@/components/feed/SuggestedUsers";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto md:px-4 py-0 flex gap-8 justify-center">
      {/* Main feed */}
      <div className="w-full max-w-[470px]">
        <StoryBar />
        <Feed />
      </div>

      {/* Sidebar — desktop only */}
      <div className="hidden lg:block w-[300px] shrink-0 pt-6">
        <SuggestedUsers />
      </div>
    </div>
  );
}
