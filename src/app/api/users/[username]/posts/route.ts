import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({ where: { username: params.username } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json(posts);
}
