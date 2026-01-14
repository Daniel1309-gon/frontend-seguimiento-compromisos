"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { accounts, inProgress } = useMsal();
  const router = useRouter();

  useEffect(() => {
    // Solo decidimos cuando MSAL haya terminado de cargar (Status.None)
    if (inProgress === InteractionStatus.None) {
      if (accounts.length > 0) {
        // Si ya tiene sesión, no lo molestamos con el login
        router.push("/dashboard");
      } else {
        // Si no tiene sesión, al login
        router.push("/login");
      }
    }
  }, [accounts, inProgress, router]);

  // Mientras decide, mostramos un spinner limpio
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );
}