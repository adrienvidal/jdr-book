"use client";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" variant={variant} disabled={pending} className={className}>
      {pending && <Loader2 className="animate-spin" />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
