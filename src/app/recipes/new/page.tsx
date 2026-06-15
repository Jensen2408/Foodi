"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewRecipePage() {
  const router = useRouter();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", prepTime: "", cookTime: "", servings: "",
    difficulty: "easy", tags: "", isPublic: true,
  });
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) { setCoverFile(files[0]); setCoverPreview(URL.createObjectURL(files[0])); }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 1 });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    let coverImage: string | null = null;
    if (coverFile) {
      const fd = new FormData();
      fd.append("file", coverFile);
      fd.append("folder", "recipes");
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await r.json();
      coverImage = d.url;
    }

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coverImage,
        ingredients: ingredients.filter(Boolean),
        steps: steps.filter(Boolean),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });

    if (res.ok) {
      const d = await res.json();
      router.push(`/recipes/${d.id}`);
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create recipe");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">New Recipe</h1>
        <p className="text-gray-400 text-sm mt-1">Share your recipe with the FoodGram community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover image */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Cover photo</h2>
          {coverPreview ? (
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image src={coverPreview} alt="" fill className="object-cover" />
              <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragActive ? "border-purple-500 bg-purple-500/10" : "border-gray-200 hover:border-purple-400"}`}>
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Drop cover photo here</p>
            </div>
          )}
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Recipe details</h2>
          <Input label="Recipe title *" placeholder="e.g. Chocolate Lava Cake" value={form.title} onChange={set("title")} required />
          <Textarea label="Description" placeholder="What makes this recipe special?" value={form.description} onChange={set("description")} rows={3} />
          <Input label="Tags (comma-separated)" placeholder="cake, chocolate, dessert, easy" value={form.tags} onChange={set("tags")} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Prep (min)</label>
              <input type="number" min="0" value={form.prepTime} onChange={set("prepTime")} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Cook (min)</label>
              <input type="number" min="0" value={form.cookTime} onChange={set("cookTime")} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Servings</label>
              <input type="number" min="1" value={form.servings} onChange={set("servings")} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={set("difficulty")} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {["easy","medium","hard","expert"].map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">Public recipe</p>
              <p className="text-xs text-gray-400">Anyone can view this recipe</p>
            </div>
            <button type="button" onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
              className={`w-12 h-6 rounded-full transition-all ${form.isPublic ? "bg-gradient-brand" : "bg-gray-200"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.isPublic ? "translate-x-6" : ""}`} />
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <h2 className="font-bold text-gray-900">Ingredients</h2>
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="w-6 h-6 bg-purple-500/10 text-purple-300 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <input value={ing} onChange={(e) => { const arr = [...ingredients]; arr[i] = e.target.value; setIngredients(arr); }}
                placeholder={`e.g. 200g dark chocolate`}
                className="flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setIngredients([...ingredients, ""])} className="flex items-center gap-2 text-sm text-purple-400 font-medium">
            <Plus className="w-4 h-4" /> Add ingredient
          </button>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <h2 className="font-bold text-gray-900">Instructions</h2>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-2">{i + 1}</span>
              <textarea value={step} onChange={(e) => { const arr = [...steps]; arr[i] = e.target.value; setSteps(arr); }}
                placeholder={`Step ${i + 1}...`} rows={2}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              {steps.length > 1 && (
                <button type="button" onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-400 mt-2">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setSteps([...steps, ""])} className="flex items-center gap-2 text-sm text-purple-400 font-medium">
            <Plus className="w-4 h-4" /> Add step
          </button>
        </div>

        {error && <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-xl">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? "Saving..." : "Publish recipe"}
          </Button>
        </div>
      </form>
    </div>
  );
}
