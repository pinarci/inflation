"use client";

import { useFormStatus } from "react-dom";

export function DeezButton({ val }: { val: number }) {
  const { pending } = useFormStatus();
  const fVal = parseFloat(val.toFixed(2));
  return pending ? (
    <button
      className="w-40 h-40 opacity-25 bg-secondary border border-primary font-bold"
      disabled
    >
      {fVal} GL
    </button>
  ) : (
    <button
      className="w-40 h-40 bg-secondary border border-primary font-bold hover:bg-primary hover:text-secondary"
      type="submit"
      name="bid"
      value={val}
    >
      {fVal} GL
    </button>
  );
}
