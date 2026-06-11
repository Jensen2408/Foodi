"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, BookOpen, Clock, Users, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  difficulty: string | null;
  tags: string | null;
  user: { id: string; username: string; avatar: string | null };
}

export default function RecipesPage() {
  const { user } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/recipes${debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : ""}`)
      .then((r) => r.json())
      .then((d) => { setRecipes(d); setLoading(false); });
  }, [debouncedSearch]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-brand-500" /> Recipe Collection
          </h1>
          <p className="text-gray-500 text-sm mt-1">Discover amazing food recipes from the community</p>
        </div>
        {user && (
          <Link href="/recipes/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> New Recipe
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recipes, ingredients, tags..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">No recipes found</h3>
          <p className="text-gray-400 text-sm mt-1">
            {search ? `No results for "${search}"` : "Be the first to share a recipe!"}
          </p>
          {user && (
            <Link href="/recipes/new" className="mt-4 inline-block">
              <Button size="sm">Share a recipe</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
              {recipe.coverImage ? (
                <div className="relative aspect-video overflow-hidden">
                  <Image src={recipe.coverImage} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {recipe.difficulty && (
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                      recipe.difficulty === "easy" ? "bg-green-500 text-white" :
                      recipe.difficulty === "medium" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                    }`}>{recipe.difficulty}</span>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-brand-100 to-pink-100 flex items-center justify-center relative">
                  <BookOpen className="w-12 h-12 text-brand-300" />
                  {recipe.difficulty && (
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                      recipe.difficulty === "easy" ? "bg-green-500 text-white" :
                      recipe.difficulty === "medium" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                    }`}>{recipe.difficulty}</span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">{recipe.title}</h3>
                {recipe.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  {recipe.prepTime && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime}m prep</span>
                  )}
                  {recipe.servings && (
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {recipe.servings}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <div className="w-5 h-5 rounded-full bg-gradient-brand flex items-center justify-center text-white text-[8px] font-bold">
                    {recipe.user.username[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{recipe.user.username}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
