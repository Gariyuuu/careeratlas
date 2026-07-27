"use client";

import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-4">
      {["light", "dark", "system"].map((t) => (
        <div key={t} className="flex items-center gap-2">
          <RadioGroupItem value={t} id={`theme-${t}`} />
          <Label htmlFor={`theme-${t}`} className="capitalize">
            {t}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
