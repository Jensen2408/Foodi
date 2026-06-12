export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const type = searchParams.get("type"); // "followers" | "following"
  if (!userId || !type) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  if (type === "followers") {
    const rows = await prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, username: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rows.map((r) => r.follower));
  } else {
    const rows = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, username: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(rows.map((r) => r.following));
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json();
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({ data: { followerId: user.id, followingId: targetUserId } });
    return NextResponse.json({ following: true });
  }
}
