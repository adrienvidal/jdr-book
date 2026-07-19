"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  // Déjà petit ET déjà en WebP → rien à faire. Sinon on ré-encode toujours en WebP.
  if (scale === 1 && /webp/i.test(file.type) && file.size < 1_000_000) return file;
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

export function PortraitUpload({
  action,
  label = "Importer une image",
  pendingLabel = "Import…",
  variant = "secondary",
  size = "lg",
  className = "w-full h-8",
}: {
  action: (formData: FormData) => Promise<void>;
  /** Texte du bouton ; `null` → bouton icône seule (overlay). */
  label?: string | null;
  pendingLabel?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const iconOnly = label === null;
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
      await action(fd);
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
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        className={className}
        aria-label={iconOnly ? "Importer une image" : undefined}
        title={iconOnly ? "Importer une image" : undefined}
      >
        {pending ? <Loader2 className="animate-spin" /> : <ImagePlus />}
        {!iconOnly && <span>{pending ? pendingLabel : label}</span>}
      </Button>
    </>
  );
}
