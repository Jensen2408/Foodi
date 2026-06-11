export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  const currentUser = await getCurrentUser();

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true, username: true, name: true, bio: true, avatar: true, website: true, createdAt: true,
      _count: { select: { posts: true, followers: true, following: true, recipes: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let isFollowing = false;
  if (currentUser && currentUser.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUser.id, followingId: user.id } },
    });
    isFollowing = !!follow;
  }

  return NextResponse.json({ ...user, isFollowing });
}
