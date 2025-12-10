// src/app/admin/layout.tsx
import type { ReactNode } from "react";
import Image from "next/image";
import { AdminSidebar } from "../../components/Sidebar/AdminSidebar";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F6F4FB]">
      <aside className="w-72 p-6 text-white bg-gradient-to-b from-[#5A189A] via-[#7B2CBF] to-[#9D4EDD] shadow-xl flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/logo.png"
            alt="Luma Logo"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div>
            <h1 className="font-semibold text-lg leading-tight">
              Luma Agenda
            </h1>
            <p className="text-xs opacity-70">Administrador</p>
          </div>
        </div>

        <AdminSidebar />
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}


