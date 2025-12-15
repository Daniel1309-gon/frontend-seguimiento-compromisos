// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  // Aquí le dices a Tailwind dónde buscar tus archivos JSX/TSX
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Importante para proyectos con App Router
  ],
  theme: {
    extend: {
      // Aquí puedes añadir tus colores, fuentes, etc.
    },
  },
  plugins: [],
}
export default config