"use client";

import { DualRangeSlider } from "./DualRangeSlider";

interface PriceRangeFilterProps {
  priceStats: { min: number; max: number };
  localPriceRange: [number, number];
  onLocalPriceChange: (range: [number, number]) => void;
  onPriceCommit: () => void;
}

export function PriceRangeFilter({
  priceStats,
  localPriceRange,
  onLocalPriceChange,
  onPriceCommit,
}: PriceRangeFilterProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Price Range</h4>
      <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Min</div>
            <div className="text-lg font-semibold text-gray-900">
              ${localPriceRange[0].toLocaleString()}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-px bg-gray-300" />
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">Max</div>
            <div className="text-lg font-semibold text-gray-900">
              ${localPriceRange[1].toLocaleString()}
            </div>
          </div>
        </div>
        <DualRangeSlider
          min={priceStats.min}
          max={priceStats.max}
          values={localPriceRange}
          onChange={onLocalPriceChange}
          onChangeEnd={onPriceCommit}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>${priceStats.min.toLocaleString()}</span>
          <span>${priceStats.max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
