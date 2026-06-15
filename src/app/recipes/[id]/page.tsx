"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, ChefHat, ArrowLeft, BookOpen } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string | null;
  ingredients: string;
  steps: string;
  tags: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string | null; avatar: string | null };
}

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetch(`/api/recipes/${id}`).then((r) => r.json()).then(setRecipe);
  }, [id]);

  if (!recipe) return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex justify-center">
      <div className="flex gap-1">
        {[0,1,2].map((i) => <div key={i} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
      </div>
    </div>
  );

  const ingredients: string[] = (() => { try { return JSON.parse(recipe.ingredients); } catch { return []; } })();
  const steps: string[] = (() => { try { return JSON.parse(recipe.steps); } catch { return []; } })();
  const tags = recipe.tags?.split(",").filter(Boolean) ?? [];
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="javascript:history.back()" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Cover */}
      {recipe.coverImage ? (
        <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-lg">
          <Image src={recipe.coverImage} alt={recipe.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <h1 className="absolute bottom-6 left-6 right-6 text-3xl font-black text-gray-900 leading-tight">{recipe.title}</h1>
        </div>
      ) : (
        <div className="aspect-video rounded-3xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex flex-col items-center justify-center mb-6">
          <BookOpen className="w-16 h-16 text-purple-300/40 mb-3" />
          <h1 className="text-3xl font-black text-gray-700 text-center px-6">{recipe.title}</h1>
        </div>
      )}

      {/* Author */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 flex items-center justify-between">
        <Link href={`/profile/${recipe.user.username}`} className="flex items-center gap-3 group">
          <Avatar src={recipe.user.avatar} alt={recipe.user.username} size="md" />
          <div>
            <p className="font-semibold text-gray-900 group-hover:text-purple-400 transition-colors">{recipe.user.username}</p>
            {recipe.user.name && <p className="text-sm text-gray-400">{recipe.user.name}</p>}
          </div>
        </Link>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-purple-500/10 text-purple-300 px-2.5 py-1 rounded-full font-medium">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Prep", value: recipe.prepTime ? `${recipe.prepTime}m` : "—", icon: Clock, color: "text-purple-400" },
          { label: "Cook", value: recipe.cookTime ? `${recipe.cookTime}m` : "—", icon: Clock, color: "text-purple-400" },
          { label: "Total", value: totalTime ? `${totalTime}m` : "—", icon: Clock, color: "text-purple-500" },
          { label: "Serves", value: recipe.servings ? `${recipe.servings}` : "—", icon: Users, color: "text-[#d4347a]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <p className="text-lg font-black text-gray-900">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {recipe.description && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <p className="text-gray-500 leading-relaxed">{recipe.description}</p>
        </div>
      )}

      {/* Difficulty */}
      {recipe.difficulty && (
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            recipe.difficulty === "easy" ? "bg-green-100 text-green-700" :
            recipe.difficulty === "medium" ? "bg-yellow-500/10 text-yellow-300" :
            recipe.difficulty === "hard" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
          }`}>
            <ChefHat className="w-4 h-4" /> {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </span>
        </div>
      )}

      {/* Ingredients */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-gradient-brand rounded-lg flex items-center justify-center text-white text-xs">🥄</span>
          Ingredients
        </h2>
        <ul className="space-y-2">
          {ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-500">
              <span className="w-6 h-6 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
              {ing}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-gradient-brand rounded-lg flex items-center justify-center text-white text-xs">📋</span>
          Instructions
        </h2>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="w-8 h-8 bg-gradient-brand text-white rounded-xl flex items-center justify-center text-sm font-black shrink-0">{i + 1}</span>
              <p className="text-gray-500 leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
