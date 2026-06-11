import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  const now = new Date();

  let userIds: string[] = [];
  if (user) {
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    });
    userIds = [user.id, ...following.map((f) => f.followingId)];
  }

  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: now },
      ...(userIds.length > 0 ? { userId: { in: userIds } } : {}),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { views: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by user
  const grouped = stories.reduce<Record<string, typeof stories>>((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {});

  const result = Object.values(grouped).map((userStories) => ({
    user: userStories[0].user,
    stories: userStories,
    hasNew: user
      ? userStories.some((s) => !s.views?.some?.((v: { viewerId: string }) => v.viewerId === user.id))
      : true,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageUrl, caption } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "Image required" }, { status: 400 });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const story = await prisma.story.create({
    data: { imageUrl, caption, expiresAt, userId: user.id },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json(story, { status: 201 });
}
