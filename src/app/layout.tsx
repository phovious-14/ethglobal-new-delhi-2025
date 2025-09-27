
import "./globals.css";
import { Suspense } from "react";
import Providers from "./providers/providers";
import Loading from "./loading";
import { ThemeProvider } from "../components/core/theme/theme-provider";
import { Toaster } from "../components/ui/toaster";
import ErrorBoundary from "./error-boundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <Providers>
              <ThemeProvider attribute="class" defaultTheme="light">
                {children}
                <Toaster />
              </ThemeProvider>
            </Providers>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
