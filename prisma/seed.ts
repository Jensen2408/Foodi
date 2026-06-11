import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "chef@foodgram.com" },
    update: {},
    create: {
      email: "chef@foodgram.com",
      username: "chefjamie",
      name: "Jamie Oliver",
      bio: "Passionate about good food. Sharing recipes that make life delicious. 🍕",
      passwordHash: hash,
    },
  });

  await prisma.recipe.upsert({
    where: { id: "seed-recipe-1" },
    update: {},
    create: {
      id: "seed-recipe-1",
      title: "Classic Chocolate Lava Cake",
      description: "A rich, indulgent molten chocolate cake that oozes warm chocolate from the center. Perfect for special occasions!",
      prepTime: 15,
      cookTime: 12,
      servings: 4,
      difficulty: "medium",
      tags: "cake,chocolate,dessert,baking",
      ingredients: JSON.stringify([
        "200g dark chocolate (70% cocoa)",
        "150g unsalted butter",
        "4 large eggs",
        "4 egg yolks",
        "120g caster sugar",
        "50g plain flour",
        "Pinch of sea salt",
        "Cocoa powder for dusting",
        "Vanilla ice cream to serve",
      ]),
      steps: JSON.stringify([
        "Preheat oven to 200°C (fan 180°C). Butter 4 ramekins and dust with cocoa powder.",
        "Melt chocolate and butter together in a bowl over simmering water, stirring until smooth. Cool slightly.",
        "Whisk eggs, yolks, and sugar together until thick and pale, about 3 minutes.",
        "Fold the chocolate mixture into the egg mixture, then gently fold in flour and salt.",
        "Divide evenly between ramekins. (Can refrigerate at this point for up to 24 hours.)",
        "Bake for 10-12 minutes until the edges are set but the centre still wobbles slightly.",
        "Run a knife around the edge and turn out onto plates. Serve immediately with ice cream.",
      ]),
      isPublic: true,
      userId: user.id,
    },
  });

  console.log("✅ Seed complete. Login: chef@foodgram.com / password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
