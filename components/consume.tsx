"use client";

import { useEffect } from "react";

export default function Consume({
  period,
  price,
}: {
  period: number;
  price: number;
}) {
  useEffect(() => {
    if (period > 0) {
      localStorage.setItem(`price${period - 1}`, price.toFixed(2));
    }
  }, [period, price]);

  if (period > 0) {
    const consumed = localStorage.getItem(`demand${period - 1}`) ?? "0";
    const pasti = localStorage.getItem(`price${period - 2}`) ?? "0";
    const inflation = parseFloat(
      ((price / parseFloat(pasti) - 1) * 100).toFixed(1)
    );
    return (
      <>
        <div className="flex items-center gap-1">
          Previous apple price:
          <span>{parseFloat(price.toFixed(2))}</span>
          {period > 1 &&
            (inflation > 0 ? (
              <span className="text-xs sm:text-lg text-green-500">
                +{inflation}%
              </span>
            ) : (
              <span className="text-xs sm:text-lg text-red-500">
                {inflation}%
              </span>
            ))}
        </div>
        <div>
          You consumed {parseFloat((Number(consumed) / price).toFixed(2))} kg
          apple
        </div>
      </>
    );
  } else {
    return;
  }
}
