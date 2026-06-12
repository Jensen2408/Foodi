import { StoryBar } from "@/components/story/StoryBar";
import { Feed } from "@/components/feed/Feed";

export default function HomePage() {
  return (
    <div className="max-w-[470px] md:max-w-[470px] mx-auto">
      <StoryBar />
      <div className="py-2">
        <Feed />
      </div>
    </div>
  );
}
