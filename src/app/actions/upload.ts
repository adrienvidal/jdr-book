"use server";
import { supabaseAdmin } from "@/lib/supabase";
import { updateCharacter } from "@/app/actions/characters";

export async function uploadPortrait(characterId: string, formData: FormData): Promise<void> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${characterId}-${Date.now()}.${ext}`;
  const sb = supabaseAdmin();
  const { error } = await sb.storage.from("portraits").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = sb.storage.from("portraits").getPublicUrl(path);
  await updateCharacter(characterId, { imageUrl: data.publicUrl });
}
