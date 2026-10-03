"use client";

import { useFormStatus } from "react-dom";

export function DeezButton({ val }: { val: number }) {
  const { pending } = useFormStatus();
  const fVal = parseFloat(val.toFixed(2));
  return pending ? (
    <button
      className="h-28 w-32 rounded-lg border bg-secondary font-bold opacity-50 sm:h-36 sm:w-40"
      disabled
    >
      {fVal} GL
    </button>
  ) : (
    <button
      className="h-28 w-32 rounded-lg border bg-secondary font-bold transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-36 sm:w-40"
      type="submit"
      name="bid"
      value={val}
    >
      {fVal} GL
    </button>
  );
}
