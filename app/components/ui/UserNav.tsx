"use client";
import { useMsal } from "@azure/msal-react";
import { LogOut, PlusCircle, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/dist/client/components/navigation";
import { useEffect, useState } from "react";
import { auditoriaService } from "@/app/services/auditoriaServices";

interface UserNavProps {
  onOpenModal: () => void;
}

export function UserNav({ onOpenModal }: UserNavProps) {
  const { instance, accounts } = useMsal();
  const activeAccount = accounts[0];
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const verification = await auditoriaService.checkIsAdmin();
        setIsAdmin(verification);
      } catch (error) {
        console.error("Error verificando permisos de administrador", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    if (activeAccount) {
      verifyAdmin();
    }
  }, [activeAccount]);

  const handleLogout = () => {
    // Cierra sesión y limpia el almacenamiento
    instance.logoutPopup().catch((e) => console.error(e));
  };

  if (activeAccount) {
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Informes de auditoría
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Hola,{" "}
            <span className="font-semibold text-blue-900 dark:text-blue-400">
              {accounts[0]?.name}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between">
          <ThemeToggle />
          {checkingAdmin ? (
            <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ) : (
            isAdmin && (
              <div className=" flex flex-row gap-3">
                <button
                  onClick={() => {
                    router.push("/admin");
                  }}
                  className="flex items-center cursor-pointer gap-2 text-white bg-gray-600 dark:text-gray-200 hover:bg-gray-900 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition border border-gray-200 dark:border-gray-600 w-full md:w-auto justify-center"
                  title="Panel de Administración"
                >
                  <Shield size={18} />
                  <span className="hidden md:inline font-medium">
                    Panel de administración
                  </span>
                </button>
                <button
                  onClick={onOpenModal}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer w-full md:w-auto justify-center"
                >
                  <PlusCircle size={20} />
                  <span className="hidden md:inline font-medium">Nuevo informe</span>
                </button>
              </div>
            )
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 bg-red-100 border-gray-950 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition text-sm font-medium cursor-pointer justify-center md:static absolute right-4 top-4 order-1 md:order-0"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            <span className="hidden md:inline font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    );
  } else {
    return null;
  }
}
