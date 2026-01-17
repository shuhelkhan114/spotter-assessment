"use client";

import { useState, useMemo } from "react";
import { Flight } from "@/lib/types";
import { RotateCcw, Plane } from "lucide-react";
import {
  StopsFilter,
  PriceRangeFilter,
  AirlinesFilter,
  ActiveFilters,
  FilterSkeleton,
} from "./filters";

export interface FilterState {
  stops: number[];
  priceRange: [number, number];
  airlines: string[];
}

interface FilterPanelProps {
  flights: Flight[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  carriers: Record<string, string>;
  isLoading?: boolean;
}

export default function FilterPanel({
  flights,
  filters,
  onFilterChange,
  carriers,
  isLoading = false,
}: FilterPanelProps) {
  const priceStats = useMemo(() => {
    if (flights.length === 0) return { min: 0, max: 1000 };
    const prices = flights.map((f) => f.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [flights]);

  const availableAirlines = useMemo(() => {
    const airlines = new Map<
      string,
      { code: string; name: string; count: number }
    >();
    flights.forEach((f) => {
      const existing = airlines.get(f.airlineCode);
      if (existing) {
        existing.count++;
      } else {
        airlines.set(f.airlineCode, {
          code: f.airlineCode,
          name: carriers[f.airlineCode] || f.airline,
          count: 1,
        });
      }
    });
    return Array.from(airlines.values()).sort((a, b) => b.count - a.count);
  }, [flights, carriers]);

  // Use a key based on price stats to reset local state when flights change
  const priceStatsKey = `${priceStats.min}-${priceStats.max}`;

  // Determine initial price range - use filter values if set, otherwise use price stats
  const getInitialPriceRange = (): [number, number] => {
    if (filters.priceRange[0] === 0 && filters.priceRange[1] === 0) {
      return [priceStats.min, priceStats.max];
    }
    return filters.priceRange;
  };

  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
    getInitialPriceRange
  );

  // Track the last known priceStatsKey to detect changes
  const [lastPriceStatsKey, setLastPriceStatsKey] = useState(priceStatsKey);

  // When priceStats change (new search), reset local price range
  if (priceStatsKey !== lastPriceStatsKey) {
    setLastPriceStatsKey(priceStatsKey);
    const newRange: [number, number] = [priceStats.min, priceStats.max];
    setLocalPriceRange(newRange);

    // Update parent filter if it was at default
    if (filters.priceRange[0] === 0 && filters.priceRange[1] === 0) {
      onFilterChange({ ...filters, priceRange: newRange });
    }
  }

  const handleStopsChange = (stop: number) => {
    const newStops = filters.stops.includes(stop)
      ? filters.stops.filter((s) => s !== stop)
      : [...filters.stops, stop];
    onFilterChange({ ...filters, stops: newStops });
  };

  const handleAirlineChange = (code: string) => {
    const newAirlines = filters.airlines.includes(code)
      ? filters.airlines.filter((a) => a !== code)
      : [...filters.airlines, code];
    onFilterChange({ ...filters, airlines: newAirlines });
  };

  const handlePriceCommit = () => {
    onFilterChange({ ...filters, priceRange: localPriceRange });
  };

  const handleResetPrice = () => {
    setLocalPriceRange([priceStats.min, priceStats.max]);
    onFilterChange({
      ...filters,
      priceRange: [priceStats.min, priceStats.max],
    });
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      stops: [],
      priceRange: [priceStats.min, priceStats.max],
      airlines: [],
    };
    setLocalPriceRange([priceStats.min, priceStats.max]);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters =
    filters.stops.length > 0 ||
    filters.airlines.length > 0 ||
    filters.priceRange[0] > priceStats.min ||
    filters.priceRange[1] < priceStats.max;

  if (isLoading) {
    return <FilterSkeleton />;
  }

  if (flights.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Plane className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            Search for flights to see filter options
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      <StopsFilter
        flights={flights}
        selectedStops={filters.stops}
        onStopChange={handleStopsChange}
      />

      <PriceRangeFilter
        priceStats={priceStats}
        localPriceRange={localPriceRange}
        onLocalPriceChange={setLocalPriceRange}
        onPriceCommit={handlePriceCommit}
      />

      <AirlinesFilter
        airlines={availableAirlines}
        selectedAirlines={filters.airlines}
        onAirlineChange={handleAirlineChange}
      />

      <ActiveFilters
        stops={filters.stops}
        airlines={filters.airlines}
        priceRange={filters.priceRange}
        priceStats={priceStats}
        carriers={carriers}
        onRemoveStop={handleStopsChange}
        onRemoveAirline={handleAirlineChange}
        onResetPrice={handleResetPrice}
      />
    </div>
  );
}
