import { StoryBar } from "@/components/story/StoryBar";
import { Feed } from "@/components/feed/Feed";

export default function HomePage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <StoryBar />
      <Feed />
    </div>
  );
}
