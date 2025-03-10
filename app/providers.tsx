"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ApolloProvider } from "@apollo/client"; // <--- Importa ApolloProvider
import client from "@/app/lib/apolloClient"; // <--- Importa tu cliente
import { AuthProvider } from "./context/AuthContext";
export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <ApolloProvider client={client}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <AuthProvider>{children}</AuthProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </ApolloProvider>
  );
}
