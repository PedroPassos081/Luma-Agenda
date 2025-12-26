import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  // Busca a primeira configuração (se houver)
  const settings = await prisma.schoolSettings.findFirst();

  return <SettingsClient initialData={settings} />;
}