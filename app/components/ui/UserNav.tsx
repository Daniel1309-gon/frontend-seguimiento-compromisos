'use client';

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/app/config/authConfig";
import { LogIn, LogOut, User } from "lucide-react";

export function UserNav() {
    const { instance, accounts } = useMsal();

    const activeAccount = accounts[0];

    const handleLogin = async () => {
        try {
            await instance.loginPopup(loginRequest);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleLogout = () => {
        instance.logoutPopup().catch((error) => {
            console.error("Logout failed:", error);
        });
    };

    if (activeAccount) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    <User size={16} />
                    <span className="font-medium">{activeAccount.username}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    <LogOut size={16} />
                    Salir
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
            <LogIn size={18} />
            Iniciar Sesión con Microsoft
        </button>
    );
}