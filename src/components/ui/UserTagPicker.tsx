"use client";
import { useState, useRef, useEffect } from "react";
import { X, UserPlus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface User {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface Props {
  tagged: User[];
  onChange: (users: User[]) => void;
}

export function UserTagPicker({ tagged, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.filter((u: User) => !tagged.find((t) => t.id === u.id)));
    }, 250);
    return () => clearTimeout(t);
  }, [query, tagged]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addUser(u: User) {
    onChange([...tagged, u]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function removeUser(id: string) {
    onChange(tagged.filter((u) => u.id !== id));
  }

  return (
    <div className="space-y-2" ref={ref}>
      <label className="block text-sm font-medium text-gray-500 flex items-center gap-1.5">
        <UserPlus className="w-4 h-4 text-purple-400" /> Tag people
      </label>

      {tagged.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagged.map((u) => (
            <span key={u.id} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm px-2.5 py-1 rounded-full">
              <Avatar src={u.avatar} alt={u.username} size="xs" />
              @{u.username}
              <button type="button" onClick={() => removeUser(u.id)} className="text-gray-400 hover:text-gray-600 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search by username..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {open && results.length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-20 animate-slide-up">
            {results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => addUser(u)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <Avatar src={u.avatar} alt={u.username} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">@{u.username}</p>
                  {u.name && <p className="text-xs text-gray-400">{u.name}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
