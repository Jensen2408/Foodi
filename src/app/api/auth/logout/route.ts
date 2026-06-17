export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    cookieStore.delete("session_token");
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session_token", "", { maxAge: 0, path: "/" });
  return res;
}
