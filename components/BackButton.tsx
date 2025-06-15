"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParams.toString();
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(`/${params ? `?${params}` : ''}`);
        }
      }}
      className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
    >
      <span aria-hidden="true">←</span> Regresar
    </button>
  );
} 