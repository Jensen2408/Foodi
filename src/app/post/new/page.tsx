"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, ChefHat, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserTagPicker } from "@/components/ui/UserTagPicker";

interface TaggedUser { id: string; username: string; name: string | null; avatar: string | null; }

interface RecipeForm {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
}

export default function NewPostPage() {
  const router = useRouter();
  const [images, setImages] = useState<{ file: File; preview: string; url?: string }[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [includeRecipe, setIncludeRecipe] = useState(false);
  const [recipe, setRecipe] = useState<RecipeForm>({
    title: "", description: "", prepTime: "", cookTime: "", servings: "",
    difficulty: "easy", ingredients: [""], steps: [""],
  });
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((files: File[]) => {
    const newImages = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...newImages].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateIngredient(i: number, val: string) {
    setRecipe((r) => { const arr = [...r.ingredients]; arr[i] = val; return { ...r, ingredients: arr }; });
  }
  function addIngredient() { setRecipe((r) => ({ ...r, ingredients: [...r.ingredients, ""] })); }
  function removeIngredient(i: number) { setRecipe((r) => ({ ...r, ingredients: r.ingredients.filter((_, idx) => idx !== i) })); }

  function updateStep(i: number, val: string) {
    setRecipe((r) => { const arr = [...r.steps]; arr[i] = val; return { ...r, steps: arr }; });
  }
  function addStep() { setRecipe((r) => ({ ...r, steps: [...r.steps, ""] })); }
  function removeStep(i: number) { setRecipe((r) => ({ ...r, steps: r.steps.filter((_, idx) => idx !== i) })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) { setError("Add at least one photo"); return; }

    setSubmitting(true);
    setUploading(true);

    const uploadedUrls: string[] = [];
    try {
      for (const img of images) {
        if (img.url) { uploadedUrls.push(img.url); continue; }
        const fd = new FormData();
        fd.append("file", img.file);
        fd.append("folder", "posts");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setError(data.error || `Upload failed (${res.status})`);
          setUploading(false);
          setSubmitting(false);
          return;
        }
        uploadedUrls.push(data.url);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed — check connection");
      setUploading(false);
      setSubmitting(false);
      return;
    }
    setUploading(false);

    const body = {
      caption,
      location,
      images: uploadedUrls,
      taggedUserIds: taggedUsers.map((u) => u.id),
      recipe: includeRecipe ? {
        ...recipe,
        ingredients: recipe.ingredients.filter(Boolean),
        steps: recipe.steps.filter(Boolean),
      } : null,
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to create post");
    }
    setSubmitting(false);
  }

  return (
    <div className="max-w-xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-2">
        <button type="button" onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 transition-colors">
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-base font-bold text-gray-900">New Post</h1>
        <button
          form="new-post-form"
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 rounded-xl bg-[#db2777] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? "Sharing..." : "Share"}
        </button>
      </div>

      <form id="new-post-form" onSubmit={handleSubmit} className="space-y-3">
        {/* Image Upload */}
        {images.length === 0 ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              isDragActive ? "border-[#db2777]/60 bg-[#db2777]/5" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">{images.length}/10</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <Image src={img.preview} alt="" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-white" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">Cover</span>}
              </div>
            ))}
            {images.length < 10 && (
              <div {...getRootProps()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <input {...getInputProps()} />
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#db2777]/30 resize-none"
          style={{background:"#f5f4f2"}}
        />

        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location"
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#db2777]/30"
            style={{background:"#f5f4f2"}}
          />
        </div>

        {/* Tags */}
        <input
          placeholder="Tags (comma separated)"
          className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#db2777]/30"
          style={{background:"#f5f4f2"}}
        />

        {/* Recipe Toggle */}
        <div className="rounded-2xl border border-gray-200 p-4" style={{background:"#f5f4f2"}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-[#db2777]" />
              <span className="font-semibold text-gray-900 text-sm">Include Recipe</span>
            </div>
            <button
              type="button"
              onClick={() => setIncludeRecipe(!includeRecipe)}
              className={`w-11 h-6 rounded-full transition-all relative ${includeRecipe ? "bg-[#db2777]" : "bg-gray-200"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${includeRecipe ? "left-5" : "left-0.5"}`} />
            </button>
          </div>

          {includeRecipe && (
            <div className="space-y-4 pt-2 animate-slide-up">
              <Input label="Recipe title" placeholder="e.g. Lemon Raspberry Cheesecake" value={recipe.title} onChange={(e) => setRecipe((r) => ({ ...r, title: e.target.value }))} />
              <Textarea label="Description" placeholder="What makes this recipe special?" value={recipe.description} onChange={(e) => setRecipe((r) => ({ ...r, description: e.target.value }))} rows={2} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Prep time (min)
                  </label>
                  <input type="number" min="0" value={recipe.prepTime} onChange={(e) => setRecipe((r) => ({ ...r, prepTime: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="15" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Cook time (min)
                  </label>
                  <input type="number" min="0" value={recipe.cookTime} onChange={(e) => setRecipe((r) => ({ ...r, cookTime: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Servings
                  </label>
                  <input type="number" min="1" value={recipe.servings} onChange={(e) => setRecipe((r) => ({ ...r, servings: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" placeholder="4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Difficulty</label>
                  <select value={recipe.difficulty} onChange={(e) => setRecipe((r) => ({ ...r, difficulty: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 capitalize">
                    {["easy", "medium", "hard", "expert"].map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">Ingredients</label>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="w-6 h-6 bg-[#fce4ef] text-[#7a0e38] rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <input value={ing} onChange={(e) => updateIngredient(i, e.target.value)}
                        placeholder="e.g. 2 cups flour"
                        className="flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                      {recipe.ingredients.length > 1 && (
                        <button type="button" onClick={() => removeIngredient(i)} className="text-gray-400 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addIngredient} className="flex items-center gap-2 text-sm text-[#9b1247] hover:text-[#7a0e38] font-medium mt-1">
                    <Plus className="w-4 h-4" /> Add ingredient
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2">Steps</label>
                <div className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="w-6 h-6 bg-[#c6185c] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-2">{i + 1}</span>
                      <textarea value={step} onChange={(e) => updateStep(i, e.target.value)}
                        placeholder={`Step ${i + 1}...`} rows={2}
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
                      {recipe.steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(i)} className="text-gray-400 hover:text-red-400 mt-2">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addStep} className="flex items-center gap-2 text-sm text-[#9b1247] hover:text-[#7a0e38] font-medium mt-1">
                    <Plus className="w-4 h-4" /> Add step
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-xl">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1">
            {uploading ? "Uploading photos..." : submitting ? "Posting..." : "Share post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
