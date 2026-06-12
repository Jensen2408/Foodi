export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ count: 0 });

  const [likes, followers] = await Promise.all([
    prisma.like.count({
      where: {
        post: { userId: me.id },
        userId: { not: me.id },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.follow.count({
      where: {
        followingId: me.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return NextResponse.json({ count: likes + followers });
}
