"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
} from "next-themes";
import { LoadingProvider } from "../../../app/context/LoadingContext";

export function ThemeProvider({ children, ...props }: { children: React.ReactNode, [key: string]: any }) {
  // Add client-side only rendering guard
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering minimal structure on server
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider {...props}>
      <LoadingProvider>{children}</LoadingProvider>
    </NextThemesProvider>
  );
}
