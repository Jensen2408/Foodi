export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 10;

  let whereClause = {};
  if (user) {
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);
    followingIds.push(user.id);
    whereClause = { userId: { in: followingIds } };
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true, name: true, avatar: true } },
      images: { orderBy: { order: "asc" } },
      recipe: true,
      _count: { select: { likes: true, comments: true } },
      likes: user ? { where: { userId: user.id } } : false,
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return NextResponse.json({ posts: items, nextCursor });
}
