"use client";
import ThemeToggle from "../components/ui/ThemeToggle";
import { LogIn } from "lucide-react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/app/config/authConfig";
import { useState, useEffect } from "react";
import { useRouter } from "next/dist/client/components/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const { instance, accounts } = useMsal();
  const router = useRouter();

  useEffect(() => {
    // Si ya hay una cuenta activa, redirige al dashboard
    if (accounts.length > 0) {
      router.push("/dashboard");
    }
  }, [accounts, router]);

  const handleLogin = async () => {
    try {
      setError("");
      await instance.loginPopup(loginRequest);
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setError("No se pudo iniciar sesión en Microsoft.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <LogIn size={32} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenido
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Sistema de seguimiento de informes de auditoría.
          <br />
          Iniciar sesión.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn size={20} />
          Ingresar con cuenta corporativa
        </button>
        <div className="mt-6 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
