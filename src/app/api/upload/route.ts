export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) ?? "posts";

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const validFolders = ["posts", "stories", "avatars", "recipes"];
  if (!validFolders.includes(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const url = await saveUploadedFile(file, folder as "posts" | "stories" | "avatars" | "recipes");
  return NextResponse.json({ url });
}
