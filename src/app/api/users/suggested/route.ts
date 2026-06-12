export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json([]);

  const following = await prisma.follow.findMany({
    where: { followerId: me.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  const users = await prisma.user.findMany({
    where: { id: { notIn: [...followingIds, me.id] } },
    select: {
      id: true, username: true, name: true, avatar: true,
      _count: { select: { followers: true } },
    },
    orderBy: { followers: { _count: "desc" } },
    take: 5,
  });

  return NextResponse.json(users);
}
