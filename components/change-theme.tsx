"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ChangeTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  return resolvedTheme === "dark" ? (
    <button onClick={() => setTheme("light")}>
      Light Mode
      <div className="ml-auto">
        <Sun className="h-4 w-4" />
      </div>
    </button>
  ) : (
    <button onClick={() => setTheme("dark")}>
      Dark Mode
      <div className="ml-auto">
        <Moon className="h-4 w-4" />
      </div>
    </button>
  );
}
