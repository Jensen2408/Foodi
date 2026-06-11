import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  hasStory?: boolean;
}

const sizes = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96 };
const ringClasses = { xs: "p-0.5", sm: "p-0.5", md: "p-[2px]", lg: "p-[3px]", xl: "p-1" };

export function Avatar({ src, alt = "User", size = "md", className, hasStory }: AvatarProps) {
  const px = sizes[size];
  const initials = alt.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full shrink-0",
        hasStory && `bg-gradient-story ${ringClasses[size]}`,
        className
      )}
    >
      <div
        className="rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-pink-400 flex items-center justify-center"
        style={{ width: px, height: px }}
      >
        {src ? (
          <Image src={src} alt={alt} width={px} height={px} className="object-cover w-full h-full" />
        ) : (
          <span className="text-white font-semibold" style={{ fontSize: px * 0.35 }}>
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
