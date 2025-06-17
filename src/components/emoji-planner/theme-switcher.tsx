"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeSwitcher() {
  const { theme, toggleTheme, isThemeLoaded } = useTheme();

  if (!isThemeLoaded) {
    // Render a placeholder or null during server rendering/initial client hydration
    return <div style={{ width: '40px', height: '40px' }} />; 
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
