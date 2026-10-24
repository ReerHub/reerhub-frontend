"use client";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import ConfirmationProvider from "./ConfirmationProvider";
export default function Providers({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  return (
    <ConfirmationProvider key={loading ? "checking" : user?.id || "guest"}>
      {children}
    </ConfirmationProvider>
  );
}
