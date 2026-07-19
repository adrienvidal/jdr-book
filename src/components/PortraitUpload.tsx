"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadPortrait } from "@/app/actions/upload";
import { Button } from "@/components/ui/button";

// Portrait affiché en petit (colonne 3:4). On redimensionne côté client pour
// ne jamais dépasser la limite des Server Actions et garder le stockage léger.
const MAX_DIM = 768;
const QUALITY = 0.82;

async function downscale(file: File): Promise<File> {
  // Formats que le canvas ne sait pas décoder (HEIC iPhone…) : on renvoie tel quel.
  if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_000_000) return file; // déjà petit
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/webp", QUALITY),
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
    type: "image/webp",
  });
}

export function PortraitUpload({ characterId }: { characterId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPending(true);
    try {
      const optimized = await downscale(file);
      const fd = new FormData();
      fd.append("file", optimized);
      await uploadPortrait(characterId, fd);
    } catch (err) {
      console.error(err);
      toast.error("L'import de l'image a échoué.");
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = ""; // re-import du même fichier possible
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className="w-full h-8"
      >
        {pending ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        {pending ? "Import…" : "Importer une image"}
      </Button>
    </>
  );
}
