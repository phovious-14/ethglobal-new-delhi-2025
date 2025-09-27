"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () => {
      return new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      });
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      {process.env.NEXT_PUBLIC_NETWORK === 'TESTNET' && <ReactQueryDevtools />}
      {children}
    </QueryClientProvider>
  );
}
