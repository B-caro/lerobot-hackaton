import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DatasetSearchBar from '@/components/DatasetSearchBar';
import { useEffect, useState } from 'react';
import DarkModeToggle from '@/components/DarkModeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Visualizador de Datasets',
  description: 'Explorador y visualizador de datasets de Hugging Face',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="w-full flex justify-end p-4">
          <DarkModeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
