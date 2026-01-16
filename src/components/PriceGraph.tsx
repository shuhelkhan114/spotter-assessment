"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Flight } from "@/lib/types";

interface PriceGraphProps {
  flights: Flight[];
  isLoading: boolean;
}

interface PriceDataPoint {
  price: number;
  count: number;
  range: string;
}

function PriceGraphSkeleton() {
  return (
    <div className="h-48 flex items-end gap-1 px-4 animate-pulse">
      {[40, 65, 80, 95, 75, 60, 45, 70, 85, 55].map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-t"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

export default function PriceGraph({ flights, isLoading }: PriceGraphProps) {
  const priceData = useMemo(() => {
    if (flights.length === 0) return [];

    const prices = flights.map((f) => f.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;

    if (range === 0) {
      return [{ price: minPrice, count: flights.length, range: `$${minPrice.toLocaleString()}` }];
    }

    const bucketCount = Math.min(10, flights.length);
    const bucketSize = range / bucketCount;

    const buckets: PriceDataPoint[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const bucketMin = minPrice + i * bucketSize;
      const bucketMax = minPrice + (i + 1) * bucketSize;
      const count = flights.filter(
        (f) => f.price >= bucketMin && (i === bucketCount - 1 ? f.price <= bucketMax : f.price < bucketMax)
      ).length;

      buckets.push({
        price: Math.round(bucketMin + bucketSize / 2),
        count,
        range: `$${Math.round(bucketMin).toLocaleString()} - $${Math.round(bucketMax).toLocaleString()}`,
      });
    }

    return buckets;
  }, [flights]);

  if (isLoading) {
    return <PriceGraphSkeleton />;
  }

  if (flights.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        Search for flights to see price trends
      </div>
    );
  }

  const minPrice = Math.min(...flights.map((f) => f.price));
  const maxPrice = Math.max(...flights.map((f) => f.price));
  const avgPrice = Math.round(flights.reduce((sum, f) => sum + f.price, 0) / flights.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500">Min:</span>{" "}
            <span className="font-semibold text-green-600">${minPrice.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Avg:</span>{" "}
            <span className="font-semibold text-gray-900">${avgPrice.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Max:</span>{" "}
            <span className="font-semibold text-red-500">${maxPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-gray-500">{flights.length} flights</div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="price"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as PriceDataPoint;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                      <div className="text-sm font-medium text-gray-900">{data.range}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.count} flight{data.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
