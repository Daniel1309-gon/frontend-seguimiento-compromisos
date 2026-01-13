"use client";
import { useMsal } from "@azure/msal-react";
import { LogOut, PlusCircle, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { ADMIN_EMAILS } from "@/app/admin/page";
import { useRouter } from "next/dist/client/components/navigation";



interface UserNavProps {
  onOpenModal: () => void;
}

export function UserNav({ onOpenModal }: UserNavProps) {
  const { instance, accounts } = useMsal();
  const activeAccount = accounts[0];
  const isAdmin = activeAccount && ADMIN_EMAILS.includes(activeAccount.username.toLocaleLowerCase());
  const router = useRouter();

  const handleLogout = () => {
    // Cierra sesión y limpia el almacenamiento
    instance.logoutPopup().catch((e) => console.error(e));
  };

  if (activeAccount) {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
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

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAdmin && (
            <button
              onClick={()=>{router.push('/admin')}}
              className="flex items-center cursor-pointer gap-2 text-white bg-gray-600 dark:text-gray-200 hover:bg-gray-900 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition border border-gray-200 dark:border-gray-600"
              title="Panel de Administración"
              >
                <Shield size={18} />
                <span className="hidden md:inline font-medium">Panel de administración</span>
              </button>
              )}
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <PlusCircle size={20} />
            Nuevo informe
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition text-sm font-medium cursor-pointer"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  } else {
    return
  }
}
