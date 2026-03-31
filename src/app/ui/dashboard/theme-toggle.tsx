"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { useTheme } from "@/app/ui/hooks/useTheme";
import { saveThemeSettings } from "@/app/lib/actions";
import type { State } from "@/app/lib/actions";
import type { Theme } from "@/app/components/theme/theme-provider";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import Button from "@/app/ui/transactions/Button/button";

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];

const THEME_ICONS: Record<Theme, React.ReactElement> = {
  light: <SunIcon className="h-5 w-5" />,
  dark: <MoonIcon className="h-5 w-5" />,
  system: <ComputerDesktopIcon className="h-5 w-5" />,
};

const THEME_LABELS: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export default function ThemeToggle({ userId }: { userId: string }) {
  const { theme, setTheme } = useTheme();
  const initialState: State = { message: null, errors: {} };
  const [, dispatch] = useActionState(saveThemeSettings, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const themeInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextTheme = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    setTheme(nextTheme);
    if (themeInputRef.current && formRef.current) {
      themeInputRef.current.value = nextTheme;
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <form ref={formRef} action={dispatch} className="hidden">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="theme" ref={themeInputRef} value={theme} />
      </form>
      <Button
        variant="ghost"
        type="button"
        onClick={handleToggle}
        title={THEME_LABELS[theme]}
        className="hidden sm:flex"
      >
        {THEME_ICONS[theme]}
        <span className="hidden sm:inline">{THEME_LABELS[theme]}</span>
      </Button>
    </>
  );
}
