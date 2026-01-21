'use client';

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();


    return (
        <button
            aria-label="Toggle Dark Mode"
            type="button"
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            suppressHydrationWarning
        >
            {theme === "dark" ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
    );
}