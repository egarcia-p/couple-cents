"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { useMemo } from "react";
import { useTheme } from "@/app/ui/hooks/useTheme";

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme,
          ...(resolvedTheme === "dark"
            ? {
                background: {
                  default: "#111827",
                  paper: "#1f2937",
                },
              }
            : {}),
        },
      }),
    [resolvedTheme],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
