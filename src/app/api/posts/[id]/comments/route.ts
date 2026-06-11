export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { text: text.trim(), userId: user.id, postId: params.id },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
