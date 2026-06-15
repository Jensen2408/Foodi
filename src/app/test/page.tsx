"use client";
import { useState } from "react";
import Image from "next/image";

export default function TestPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-16">
      <h1 className="text-2xl font-black text-gray-900">3D Effects Preview</h1>

      {/* 1. Card Tilt */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">1 — Card Tilt on Hover</h2>
        <TiltCard />
      </section>

      {/* 2. Floating Logo */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">2 — Floating Logo</h2>
        <div className="flex items-center justify-center py-10 bg-gray-50 rounded-3xl">
          <style>{`
            @keyframes float3d {
              0%, 100% { transform: translateY(0px) rotateY(0deg) rotateX(0deg); }
              33%       { transform: translateY(-12px) rotateY(12deg) rotateX(4deg); }
              66%       { transform: translateY(-6px) rotateY(-8deg) rotateX(-2deg); }
            }
            .logo-float { animation: float3d 4s ease-in-out infinite; filter: drop-shadow(0 16px 24px rgba(219,39,119,0.25)); }
          `}</style>
          <Image src="/logo.png" alt="Morsel" width={96} height={96} className="rounded-2xl logo-float" />
        </div>
      </section>

      {/* 3. 3D Button */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">3 — 3D Button Press</h2>
        <div className="flex gap-4">
          <Button3D label="Share Post" />
          <Button3D label="Follow" secondary />
        </div>
      </section>

      {/* 4. Glassmorphism Card */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">4 — Glassmorphism Card</h2>
        <div className="relative rounded-3xl overflow-hidden p-1" style={{background:"linear-gradient(135deg,#db2777,#a855f7)"}}>
          <div style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            padding: "24px",
          }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">M</div>
              <div>
                <p className="font-bold text-gray-900">morseluser</p>
                <p className="text-xs text-gray-400">Copenhagen, Denmark</p>
              </div>
            </div>
            <div className="h-40 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-4xl mb-3">🍜</div>
            <p className="text-sm text-gray-600">This is what a glassmorphism post card would look like ✨</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-400">
              <span>❤️ 128 likes</span>
              <span>💬 24 comments</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function TiltCard() {
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / 12;
    const y = -(e.clientX - rect.left - rect.width / 2) / 12;
    e.currentTarget.style.transform = `perspective(700px) rotateX(${x}deg) rotateY(${y}deg) scale(1.02)`;
  };
  const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)";
  };
  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.15s ease", willChange: "transform" }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">M</div>
        <div>
          <p className="font-bold text-gray-900">morseluser</p>
          <p className="text-xs text-gray-400">Move your mouse over this card</p>
        </div>
      </div>
      <div className="h-48 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl">🍣</div>
      <p className="text-sm text-gray-500 mt-3">Hover over me to see the 3D tilt effect!</p>
    </div>
  );
}

function Button3D({ label, secondary }: { label: string; secondary?: boolean }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        transform: pressed
          ? "perspective(400px) translateZ(-6px) translateY(3px) scale(0.97)"
          : "perspective(400px) translateZ(0px) translateY(0px) scale(1)",
        transition: "transform 0.1s ease",
        boxShadow: pressed
          ? "0 1px 4px rgba(0,0,0,0.1)"
          : secondary
            ? "0 4px 12px rgba(0,0,0,0.08)"
            : "0 4px 16px rgba(219,39,119,0.35)",
        background: secondary ? "#ffffff" : "linear-gradient(135deg,#db2777,#a855f7)",
        border: secondary ? "1px solid #e5e7eb" : "none",
        color: secondary ? "#374151" : "#ffffff",
        padding: "10px 24px",
        borderRadius: "12px",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
