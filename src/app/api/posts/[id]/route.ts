import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, username: true, name: true, avatar: true } },
      images: { orderBy: { order: "asc" } },
      recipe: true,
      comments: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { likes: true, comments: true } },
      likes: user ? { where: { userId: user.id } } : false,
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post || post.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
