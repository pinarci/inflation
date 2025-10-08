"use client";

import { useState, useEffect } from "react";

export const DeezCounter = () => {
  const [seconds, setSeconds] = useState(15);

  useEffect(() => {
    const tick = () => {
      if (seconds === 0) return;
      setSeconds(seconds - 1);
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return (
    seconds > 0 && (
      <div className="text-red-500 text-2xl font-mono">
        {seconds} seconds left
      </div>
    )
  );
};
