"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutGrid,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Settings,
  ClipboardPen,
  BadgeInfo,
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  label: string;
  icon: ReactNode;
}

function SidebarItem({ href, label, icon }: SidebarItemProps) {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${isActive
          ? "bg-white text-purple-700 shadow-sm"
          : "text-white/90 hover:bg-white/10 hover:text-white"}
      `}
    >
      <div
        className={`flex items-center justify-center ${
          isActive ? "text-purple-700" : "text-white/90"
        }`}
      >
        <span className="w-6 h-6 flex items-center justify-center">
          {icon}
        </span>
      </div>

      <span
        className={`text-[15px] font-medium ${
          isActive ? "text-purple-700" : ""
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function AdminSidebar() {
  return (
    <nav className="flex flex-col gap-4">
      <SidebarItem href="/admin" label="Dashboard" icon={<LayoutGrid />} />
      <SidebarItem href="/admin/turmas" label="Turmas" icon={<Users />} />
      <SidebarItem href="/admin/alunos" label="Alunos" icon={<Users />} />
      <SidebarItem
        href="/admin/professores"
        label="Professores"
        icon={<GraduationCap />}
      />
      <SidebarItem
        href="/admin/notas"
        label="Notas"
        icon={<ClipboardPen />}
      />
      <SidebarItem
        href="/admin/disciplinas"
        label="Disciplinas"
        icon={<BookOpen />}
      />
      <SidebarItem
        href="/admin/informativos"
        label="Informativos"
        icon={<BadgeInfo />}
      />
      <SidebarItem
        href="/admin/relatorios"
        label="Relatórios"
        icon={<FileText />}
      />
      <SidebarItem
        href="/admin/config"
        label="Configurações"
        icon={<Settings />}
      />
    </nav>
  );
}
