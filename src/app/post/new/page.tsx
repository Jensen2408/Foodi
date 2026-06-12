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

    // Upload images
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Share a dish</h1>
        <p className="text-gray-500 text-sm mt-1">Show the world your food creation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Photos</h2>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={img.preview} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-full">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {images.length < 10 && (
                <div
                  {...getRootProps()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
                >
                  <input {...getInputProps()} />
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          )}

          {images.length === 0 && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragActive ? "border-pink-500 bg-pink-50" : "border-gray-200 hover:border-pink-400 hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">Drop your food photos here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse · Up to 10 photos</p>
            </div>
          )}
        </div>

        {/* Post Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Details</h2>
          <Textarea
            label="Caption"
            placeholder="Tell the story of this dish..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
          />
          <Input
            label="Location"
            placeholder="Where was this made?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <UserTagPicker tagged={taggedUsers} onChange={setTaggedUsers} />
        </div>

        {/* Recipe Toggle */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-pink-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Attach a Recipe</h2>
                <p className="text-xs text-gray-500">Let people cook this dish too</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeRecipe(!includeRecipe)}
              className={`w-12 h-6 rounded-full transition-all ${includeRecipe ? "bg-gradient-brand" : "bg-gray-200"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${includeRecipe ? "translate-x-6" : ""}`} />
            </button>
          </div>

          {includeRecipe && (
            <div className="space-y-4 pt-2 animate-slide-up">
              <Input label="Recipe title" placeholder="e.g. Lemon Raspberry Cheesecake" value={recipe.title} onChange={(e) => setRecipe((r) => ({ ...r, title: e.target.value }))} />
              <Textarea label="Description" placeholder="What makes this recipe special?" value={recipe.description} onChange={(e) => setRecipe((r) => ({ ...r, description: e.target.value }))} rows={2} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Prep time (min)
                  </label>
                  <input type="number" min="0" value={recipe.prepTime} onChange={(e) => setRecipe((r) => ({ ...r, prepTime: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="15" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Cook time (min)
                  </label>
                  <input type="number" min="0" value={recipe.cookTime} onChange={(e) => setRecipe((r) => ({ ...r, cookTime: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Servings
                  </label>
                  <input type="number" min="1" value={recipe.servings} onChange={(e) => setRecipe((r) => ({ ...r, servings: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="4" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select value={recipe.difficulty} onChange={(e) => setRecipe((r) => ({ ...r, difficulty: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 capitalize">
                    {["easy", "medium", "hard", "expert"].map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
                  </select>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ingredients</label>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="w-6 h-6 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <input value={ing} onChange={(e) => updateIngredient(i, e.target.value)}
                        placeholder={`e.g. 2 cups flour`}
                        className="flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" />
                      {recipe.ingredients.length > 1 && (
                        <button type="button" onClick={() => removeIngredient(i)} className="text-gray-400 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addIngredient} className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium mt-1">
                    <Plus className="w-4 h-4" /> Add ingredient
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Steps</label>
                <div className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-2">{i + 1}</span>
                      <textarea value={step} onChange={(e) => updateStep(i, e.target.value)}
                        placeholder={`Step ${i + 1}...`} rows={2}
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" />
                      {recipe.steps.length > 1 && (
                        <button type="button" onClick={() => removeStep(i)} className="text-gray-400 hover:text-red-400 mt-2">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addStep} className="flex items-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium mt-1">
                    <Plus className="w-4 h-4" /> Add step
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

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
