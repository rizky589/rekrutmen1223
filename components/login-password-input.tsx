"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/components/ui/input";

export function LoginPasswordInput() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300" />
      <Input
        id="password"
        name="password"
        type={isVisible ? "text" : "password"}
        autoComplete="current-password"
        placeholder="Masukkan password"
        className="h-12 border-cyan-300/30 bg-cyan-300/[0.06] px-11 font-mono text-cyan-50 placeholder:text-cyan-200/35 focus-visible:border-cyan-300 focus-visible:ring-cyan-300/40"
        required
      />
      <button
        type="button"
        aria-label={isVisible ? "Sembunyikan password" : "Lihat password"}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((value) => !value)}
        className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-md text-cyan-300 transition hover:bg-cyan-300/10 hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
