"use client";

import { useState, useEffect } from "react";

export const DeezCounter = () => {
  const [seconds, setSeconds] = useState(15);

  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(() => setSeconds((current) => current - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return (
    seconds > 0 && (
      <div className="text-destructive text-lg font-mono" role="timer" aria-live="polite">
        {seconds} seconds left
      </div>
    )
  );
};
