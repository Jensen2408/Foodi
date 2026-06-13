"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewStoryPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [] }, maxFiles: 1,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "stories");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    const { url } = await uploadRes.json();

    await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url, caption }),
    });

    router.push("/");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Add a story</h1>
        <p className="text-white/40 text-sm mt-1">Disappears after 24 hours</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-[#0f1520] rounded-2xl border border-white/[0.06] shadow-sm p-6">
          {preview ? (
            <div className="relative">
              <div className="relative aspect-[9/16] max-h-96 rounded-2xl overflow-hidden">
                <Image src={preview} alt="" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                isDragActive ? "border-purple-500 bg-purple-500/10" : "border-white/[0.08] hover:border-purple-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="font-semibold text-white/60">Drop your story photo</p>
              <p className="text-sm text-white/30 mt-1">Tap to browse</p>
            </div>
          )}
        </div>

        <div className="bg-[#0f1520] rounded-2xl border border-white/[0.06] shadow-sm p-6">
          <Input
            label="Caption (optional)"
            placeholder="What's cooking? 🍳"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={!file || submitting} className="flex-1">
            {submitting ? "Sharing..." : "Share story"}
          </Button>
        </div>
      </form>
    </div>
  );
}
