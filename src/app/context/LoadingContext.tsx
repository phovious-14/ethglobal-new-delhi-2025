"use client";

import { LoaderOverlay } from "@/src/components/LoaderOverlay/LoaderOverlay";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";

type LoadingContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => { },
});

type LoadingProviderProps = {
  children: ReactNode;
};

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  // Start with a consistent initial state for both server and client
  const [loading, setLoading] = useState(false);
  // Use this to track if we're mounted on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This only runs on client, after hydration
    setMounted(true);
  }, []);

  const value = { loading, setLoading };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {/* Only show loader overlay when client-side mounted to avoid hydration mismatch */}
      {mounted && loading && <LoaderOverlay />}
    </LoadingContext.Provider>
  );
};

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
