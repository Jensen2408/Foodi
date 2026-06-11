export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const search = searchParams.get("q");

  const recipes = await prisma.recipe.findMany({
    where: {
      isPublic: true,
      ...(userId ? { userId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { tags: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, coverImage, prepTime, cookTime, servings, difficulty, ingredients, steps, tags, isPublic } = body;

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      coverImage,
      prepTime: prepTime ? parseInt(prepTime) : null,
      cookTime: cookTime ? parseInt(cookTime) : null,
      servings: servings ? parseInt(servings) : null,
      difficulty,
      ingredients: JSON.stringify(ingredients),
      steps: JSON.stringify(steps),
      tags: tags ? tags.join(",") : null,
      isPublic: isPublic ?? true,
      userId: user.id,
    },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  });

  return NextResponse.json(recipe, { status: 201 });
}
