export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [users, posts, recipes, comments, likes, stories] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.recipe.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.story.count(),
  ]);

  return NextResponse.json({ users, posts, recipes, comments, likes, stories });
}
