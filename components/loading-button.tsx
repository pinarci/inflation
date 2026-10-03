"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingButton({
  idleLabel = "Continue",
  pendingLabel = "Working…",
  className,
}: {
  idleLabel?: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={cn(className)}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
