import { prisma } from "@/lib/prisma";
import AnnouncementsClient from "./AnnouncementsClient";

export default async function InformativosPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" }, // Mais recentes primeiro
  });

  return <AnnouncementsClient data={announcements} />;
}