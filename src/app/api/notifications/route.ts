export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ count: 0, items: [] });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  const lastSeenStr = cookieStore.get("notif_seen")?.value;
  const lastSeen = lastSeenStr ? new Date(lastSeenStr) : since;

  const [likes, follows, comments] = await Promise.all([
    prisma.like.findMany({
      where: { post: { userId: me.id }, userId: { not: me.id }, createdAt: { gte: since } },
      include: { user: { select: { username: true, avatar: true } }, post: { select: { id: true, images: { take: 1 } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.follow.findMany({
      where: { followingId: me.id, createdAt: { gte: since } },
      include: { follower: { select: { username: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.comment.findMany({
      where: { post: { userId: me.id }, userId: { not: me.id }, createdAt: { gte: since } },
      include: { user: { select: { username: true, avatar: true } }, post: { select: { id: true, images: { take: 1 } } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const items = [
    ...likes.map((l) => ({
      id: `like-${l.id}`,
      type: "like" as const,
      user: l.user,
      postId: l.post.id,
      postImage: l.post.images[0]?.url ?? null,
      createdAt: l.createdAt,
    })),
    ...follows.map((f) => ({
      id: `follow-${f.id}`,
      type: "follow" as const,
      user: f.follower,
      postId: null,
      postImage: null,
      createdAt: f.createdAt,
    })),
    ...comments.map((c) => ({
      id: `comment-${c.id}`,
      type: "comment" as const,
      user: c.user,
      postId: c.post.id,
      postImage: c.post.images[0]?.url ?? null,
      text: c.text,
      createdAt: c.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const count = items.filter((i) => new Date(i.createdAt) > lastSeen).length;

  return NextResponse.json({ count, items });
}

export async function POST() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ ok: false });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("notif_seen", new Date().toISOString(), {
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
