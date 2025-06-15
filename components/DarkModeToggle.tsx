"use client";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // Leer preferencia de localStorage al cargar
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') setDark(true);
    if (stored === 'false') setDark(false);
  }, []);

  // Aplicar y guardar preferencia
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('darkMode', 'false');
    }
  }, [dark]);

  return (
    <button
      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      onClick={() => setDark((d) => !d)}
      aria-label="Alternar modo oscuro"
    >
      {dark ? "☀️ Modo claro" : "🌙 Modo oscuro"}
    </button>
  );
} 