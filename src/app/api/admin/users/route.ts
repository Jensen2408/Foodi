export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, username: true, name: true, email: true, avatar: true,
      isAdmin: true, createdAt: true,
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });

  return NextResponse.json(users);
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await req.json();
  if (id === user.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, isAdmin, username: newUsername } = await req.json();
  if (newUsername !== undefined) {
    const existing = await prisma.user.findUnique({ where: { username: newUsername } });
    if (existing && existing.id !== id) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    await prisma.user.update({ where: { id }, data: { username: newUsername } });
    return NextResponse.json({ success: true });
  }
  await prisma.user.update({ where: { id }, data: { isAdmin } });
  return NextResponse.json({ success: true });
}
