import type { Metadata } from "next";
import { Toaster } from "sonner"; 
import "./globals.css";
import { AuthProvider } from "./providers";

export const metadata: Metadata = {
  title: "Luma Class",
  description: "Mini Proesc moderno com IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}