import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { caption, location, images, recipe } = body;

  if (!images || images.length === 0) {
    return NextResponse.json({ error: "At least one image required" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      caption,
      location,
      userId: user.id,
      images: {
        create: images.map((url: string, i: number) => ({ url, order: i })),
      },
      ...(recipe
        ? {
            recipe: {
              create: {
                title: recipe.title,
                description: recipe.description,
                prepTime: recipe.prepTime ? parseInt(recipe.prepTime) : null,
                cookTime: recipe.cookTime ? parseInt(recipe.cookTime) : null,
                servings: recipe.servings ? parseInt(recipe.servings) : null,
                difficulty: recipe.difficulty,
                ingredients: JSON.stringify(recipe.ingredients),
                steps: JSON.stringify(recipe.steps),
              },
            },
          }
        : {}),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      images: true,
      recipe: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
