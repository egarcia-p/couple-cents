"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/app/ui/hooks/useTheme";
import { saveThemeSettings } from "@/app/lib/actions";
import type { State } from "@/app/lib/actions";
import type { Theme } from "@/app/components/theme/theme-provider";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";

const THEME_OPTIONS: { value: Theme; icon: React.ReactElement }[] = [
  { value: "light", icon: <SunIcon className="h-5 w-5" /> },
  { value: "dark", icon: <MoonIcon className="h-5 w-5" /> },
  { value: "system", icon: <ComputerDesktopIcon className="h-5 w-5" /> },
];

export default function ThemeSettings({ userId }: { userId: string }) {
  const t = useTranslations("Profile");
  const { theme, setTheme } = useTheme();
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(saveThemeSettings, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const themeInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (themeInputRef.current && formRef.current) {
      themeInputRef.current.value = newTheme;
      formRef.current.requestSubmit();
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
      <div className="ml-4 m-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold">{t("theme.title")}</h1>
        <form ref={formRef} action={dispatch}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="theme" ref={themeInputRef} value={theme} />
          <div className="flex flex-wrap gap-3">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  theme === option.value
                    ? "border-primary-600 bg-primary-100 dark:bg-primary-600/20 text-primary-600 dark:text-primary-100"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                {option.icon}
                <span>
                  {t(
                    `theme.${option.value}` as
                      | "theme.light"
                      | "theme.dark"
                      | "theme.system",
                  )}
                </span>
              </button>
            ))}
          </div>
        </form>
        {state.message && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
      </div>
    </div>
  );
}
