"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate } = useUser();
  const [form, setForm] = useState({ email: "", username: "", name: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    mutate(data.user);
    router.push("/");
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-[#f8f6f3]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 space-y-6 shadow-sm">
          <div className="text-center space-y-2">
            <Image src="/logo.png" alt="Morsel" width={64} height={64} className="rounded-2xl mx-auto shadow-lg" />
            <h1 className="text-2xl font-black text-gradient-brand">Join Morsel</h1>
            <p className="text-sm text-gray-400">Share your food passion with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" placeholder="Gordon Ramsay" value={form.name} onChange={set("name")} />
            <Input label="Username" placeholder="gordongrams" value={form.username} onChange={set("username")} required />
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={set("password")}
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-gray-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-gray-900 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
