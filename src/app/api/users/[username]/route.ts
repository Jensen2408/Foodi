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

export async function PATCH(req: NextRequest, { params }: { params: { username: string } }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (currentUser.username !== params.username) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, bio, website, avatar } = body;

  const updated = await prisma.user.update({
    where: { username: params.username },
    data: {
      ...(name !== undefined && { name: name || null }),
      ...(bio !== undefined && { bio: bio || null }),
      ...(website !== undefined && { website: website || null }),
      ...(avatar !== undefined && { avatar: avatar || null }),
    },
    select: { id: true, username: true, name: true, bio: true, avatar: true, website: true },
  });

  return NextResponse.json(updated);
}
