export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      images: { take: 1 },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json(posts);
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
