"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 dark:text-secondary">
        <div className="h-80 min-w-0 rounded-xl border bg-white p-2">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
        </ResponsiveContainer>
        </div>
        <div className="h-80 min-w-0 rounded-xl border bg-white p-2">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
        </ResponsiveContainer>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-2xl py-2">TEDU ERU</div>
        <Button asChild variant="secondary">
          <a href="https://sites.google.com/view/erutedu/home" target="_blank" rel="noreferrer">
            About us
          </a>
        </Button>
      </div>
    </>
  );
}
