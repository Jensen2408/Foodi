import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveUploadedFile(
  file: File,
  folder: "posts" | "stories" | "avatars" | "recipes"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);
  return `/uploads/${folder}/${filename}`;
}
