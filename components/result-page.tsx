"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";

type Logs = {
  balances: number;
  expenditure: number;
  period: number;
  price: number;
}[];

export default function ResultPage({ data }: { data: Logs }) {
  const plain = data.map((item) => {
    return {
      period: item.period,
      money: item.balances,
      price: item.price,
      velocity: parseFloat(
        ((item.expenditure / item.balances) * 100).toFixed(2)
      ),
    };
  });

  const growth = plain.map((item, index) => {
    if (index === 0) {
      return {
        period: 0,
        money: 0,
        price: 0,
      };
    }

    return {
      period: item.period,
      money: parseFloat(
        ((item.money / plain[index - 1]?.money - 1) * 100).toFixed(2)
      ),
      price: parseFloat(
        ((item.price / plain[index - 1]?.price - 1) * 100).toFixed(2)
      ),
    };
  });

  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-16 dark:text-secondary">
        <LineChart
          width={350}
          height={350}
          data={growth}
          margin={{
            top: 20,
            right: 20,
            left: -20,
            bottom: 20,
          }}
        >
          <XAxis
            dataKey="period"
            label={{ value: "Period", position: "bottom" }}
          />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            dot={false}
            type="monotone"
            dataKey="money"
            name="Money Growth"
            stroke="#00ff00"
          />
          <Line
            dot={false}
            type="monotone"
            dataKey="price"
            name="Inflation"
            stroke="#ff0000"
          />
        </LineChart>
        <LineChart
          width={350}
          height={350}
          data={plain}
          margin={{
            top: 20,
            right: 20,
            left: -20,
            bottom: 20,
          }}
        >
          <XAxis
            dataKey="period"
            label={{ value: "Period", position: "bottom" }}
          />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Line
            dot={false}
            type="monotone"
            dataKey="velocity"
            name="Velocity"
            stroke="#0000ff"
          />
        </LineChart>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl py-2">TEDU ERU</div>
        <Button asChild variant="secondary">
          <a href="https://sites.google.com/view/erutedu/home" target="_blank">
            About us
          </a>
        </Button>
      </div>
    </>
  );
}
