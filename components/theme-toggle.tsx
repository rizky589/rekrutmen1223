"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useAppTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <Button variant="ghost" size="icon" type="button" onClick={() => setTheme(isDark ? "light" : "dark")} aria-label="Ubah tema">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
