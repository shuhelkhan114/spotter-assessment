"use client";

import { X } from "lucide-react";

interface ActiveFiltersProps {
  stops: number[];
  airlines: string[];
  priceRange: [number, number];
  priceStats: { min: number; max: number };
  carriers: Record<string, string>;
  onRemoveStop: (stop: number) => void;
  onRemoveAirline: (code: string) => void;
  onResetPrice: () => void;
}

export function ActiveFilters({
  stops,
  airlines,
  priceRange,
  priceStats,
  carriers,
  onRemoveStop,
  onRemoveAirline,
  onResetPrice,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    stops.length > 0 ||
    airlines.length > 0 ||
    priceRange[0] > priceStats.min ||
    priceRange[1] < priceStats.max;

  if (!hasActiveFilters) return null;

  const getStopLabel = (stop: number) => {
    if (stop === 0) return "Nonstop";
    if (stop === 1) return "1 stop";
    return `${stop}+ stops`;
  };

  return (
    <div className="pt-4 border-t border-gray-100">
      <div className="text-xs font-medium text-gray-500 mb-2">Active filters</div>
      <div className="flex flex-wrap gap-2">
        {stops.map((stop) => (
          <button
            key={`stop-${stop}`}
            onClick={() => onRemoveStop(stop)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors group cursor-pointer"
          >
            {getStopLabel(stop)}
            <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </button>
        ))}
        {airlines.map((code) => (
          <button
            key={`airline-${code}`}
            onClick={() => onRemoveAirline(code)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors group cursor-pointer"
          >
            {carriers[code] || code}
            <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </button>
        ))}
        {(priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) && (
          <button
            onClick={onResetPrice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors group cursor-pointer"
          >
            ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
            <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </button>
        )}
      </div>
    </div>
  );
}
