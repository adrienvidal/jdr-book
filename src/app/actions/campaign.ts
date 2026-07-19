"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const ID = "main";

// Singleton de campagne : renvoie l'enregistrement, le crée au besoin.
export async function getCampaign() {
  return prisma.campaign.upsert({ where: { id: ID }, update: {}, create: { id: ID } });
}

// Titre affiché sur le hero MJ et la card MJ de l'accueil (éditable comme un nom de perso).
export async function updateCampaignTitle(title: string): Promise<void> {
  await prisma.campaign.upsert({
    where: { id: ID },
    update: { mjTitle: title },
    create: { id: ID, mjTitle: title },
  });
  revalidatePath("/mj");
  revalidatePath("/table");
}
