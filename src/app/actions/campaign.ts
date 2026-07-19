"use server";
import { prisma } from "@/lib/prisma";

const ID = "main";

// Singleton de campagne : renvoie l'enregistrement, le crée au besoin.
export async function getCampaign() {
  return prisma.campaign.upsert({ where: { id: ID }, update: {}, create: { id: ID } });
}
