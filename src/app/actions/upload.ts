"use server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { updateCharacter } from "@/app/actions/characters";

// Envoie un fichier dans le bucket « portraits » et renvoie son URL publique.
async function uploadToBucket(prefix: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "webp";
  const path = `${prefix}-${Date.now()}.${ext}`;
  const sb = supabaseAdmin();
  const { error } = await sb.storage.from("portraits").upload(path, file, { upsert: true });
  if (error) throw error;
  return sb.storage.from("portraits").getPublicUrl(path).data.publicUrl;
}

export async function uploadPortrait(characterId: string, formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;
  const url = await uploadToBucket(characterId, file);
  await updateCharacter(characterId, { imageUrl: url });
}

export async function uploadMjPortrait(formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;
  const url = await uploadToBucket("mj", file);
  await prisma.campaign.upsert({
    where: { id: "main" },
    update: { mjImageUrl: url },
    create: { id: "main", mjImageUrl: url },
  });
  revalidatePath("/table");
  revalidatePath("/mj");
}
