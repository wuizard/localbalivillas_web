"use client";

import { I18nProvider, RouterProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* en-GB gives react-aria calendars Monday-first weeks, which is what guests expect here. */}
      <I18nProvider locale="en-GB">
        <RouterProvider navigate={router.push}>{children}</RouterProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
