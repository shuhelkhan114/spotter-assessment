"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Flight } from "@/lib/types";
import { X, RotateCcw, Check, Plane, Clock, ChevronDown, ChevronUp } from "lucide-react";

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

// Custom checkbox component
function CustomCheckbox({
  checked,
  onChange,
  label,
  count,
  icon,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 ${
        checked
          ? "border-blue-500 bg-blue-50/50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
            checked
              ? "bg-blue-500 text-white"
              : "bg-gray-100 border border-gray-200"
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </div>
        <div className="flex items-center gap-2">
          {icon}
          <span
            className={`text-sm font-medium ${
              checked ? "text-gray-900" : "text-gray-600"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          checked ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// Dual range slider component
function DualRangeSlider({
  min,
  max,
  values,
  onChange,
  onChangeEnd,
}: {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
  onChangeEnd: () => void;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const getPercent = useCallback(
    (value: number) => ((value - min) / (max - min)) * 100,
    [min, max]
  );

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return min;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(min + percent * (max - min));
    },
    [min, max]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: "min" | "max") => {
      e.preventDefault();
      setDragging(handle);
    },
    []
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, handle: "min" | "max") => {
      setDragging(handle);
    },
    []
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (clientX: number) => {
      const newValue = getValueFromPosition(clientX);
      if (dragging === "min") {
        onChange([Math.min(newValue, values[1] - 10), values[1]]);
      } else {
        onChange([values[0], Math.max(newValue, values[0] + 10)]);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    const handleEnd = () => {
      setDragging(null);
      onChangeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [dragging, values, getValueFromPosition, onChange, onChangeEnd]);

  const minPercent = getPercent(values[0]);
  const maxPercent = getPercent(values[1]);

  return (
    <div className="pt-2 pb-4">
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-150 ${
            dragging === "min"
              ? "border-blue-600 scale-110 shadow-blue-200"
              : "border-blue-500 hover:scale-105"
          }`}
          style={{ left: `${minPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, "min")}
          onTouchStart={(e) => handleTouchStart(e, "min")}
        >
          <div className="absolute inset-1 bg-blue-500 rounded-full" />
        </div>

        {/* Max handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-150 ${
            dragging === "max"
              ? "border-blue-600 scale-110 shadow-blue-200"
              : "border-blue-500 hover:scale-105"
          }`}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, "max")}
          onTouchStart={(e) => handleTouchStart(e, "max")}
        >
          <div className="absolute inset-1 bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function FilterSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-16" />
      </div>

      {/* Stops skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Price range skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-px bg-gray-200" />
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Airlines skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FilterPanel({
  flights,
  filters,
  onFilterChange,
  carriers,
  isLoading = false,
}: FilterPanelProps) {
  const [showAllAirlines, setShowAllAirlines] = useState(false);
  const AIRLINES_INITIAL_SHOW = 4;

  const priceStats = useMemo(() => {
    if (flights.length === 0) return { min: 0, max: 1000 };
    const prices = flights.map((f) => f.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [flights]);

  const availableStops = useMemo(() => {
    const stops = new Set(flights.map((f) => f.stops));
    return Array.from(stops).sort();
  }, [flights]);

  const availableAirlines = useMemo(() => {
    const airlines = new Map<string, { code: string; name: string; count: number }>();
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

  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(filters.priceRange);

  useEffect(() => {
    if (flights.length > 0) {
      const newRange: [number, number] = [priceStats.min, priceStats.max];
      setLocalPriceRange(newRange);
      if (filters.priceRange[0] === 0 && filters.priceRange[1] === 0) {
        onFilterChange({ ...filters, priceRange: newRange });
      }
    }
  }, [priceStats.min, priceStats.max, flights.length]);

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

  const getStopLabel = (stop: number) => {
    if (stop === 0) return "Nonstop";
    if (stop === 1) return "1 stop";
    return `${stop}+ stops`;
  };

  const getStopIcon = (stop: number) => {
    if (stop === 0) return <Plane className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-orange-500" />;
  };

  // Show skeleton when loading
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
          <p className="text-sm text-gray-500">Search for flights to see filter options</p>
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      {/* Stops Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Stops</h4>
        <div className="space-y-2">
          {availableStops.map((stop) => {
            const count = flights.filter((f) => f.stops === stop).length;
            return (
              <CustomCheckbox
                key={stop}
                checked={filters.stops.includes(stop)}
                onChange={() => handleStopsChange(stop)}
                label={getStopLabel(stop)}
                count={count}
                icon={getStopIcon(stop)}
              />
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
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
            onChange={setLocalPriceRange}
            onChangeEnd={handlePriceCommit}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>${priceStats.min.toLocaleString()}</span>
            <span>${priceStats.max.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Airlines Filter */}
      {availableAirlines.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Airlines</h4>
            <span className="text-xs text-gray-400">{availableAirlines.length} available</span>
          </div>
          <div className="space-y-2">
            {(showAllAirlines ? availableAirlines : availableAirlines.slice(0, AIRLINES_INITIAL_SHOW)).map((airline) => (
              <CustomCheckbox
                key={airline.code}
                checked={filters.airlines.includes(airline.code)}
                onChange={() => handleAirlineChange(airline.code)}
                label={airline.name}
                count={airline.count}
              />
            ))}
          </div>
          {availableAirlines.length > AIRLINES_INITIAL_SHOW && (
            <button
              onClick={() => setShowAllAirlines(!showAllAirlines)}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showAllAirlines ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  See all ({availableAirlines.length})
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-2">Active filters</div>
          <div className="flex flex-wrap gap-2">
            {filters.stops.map((stop) => (
              <button
                key={`stop-${stop}`}
                onClick={() => handleStopsChange(stop)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors group"
              >
                {getStopLabel(stop)}
                <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
            {filters.airlines.map((code) => (
              <button
                key={`airline-${code}`}
                onClick={() => handleAirlineChange(code)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors group"
              >
                {carriers[code] || code}
                <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
            {(filters.priceRange[0] > priceStats.min ||
              filters.priceRange[1] < priceStats.max) && (
              <button
                onClick={() => {
                  setLocalPriceRange([priceStats.min, priceStats.max]);
                  onFilterChange({
                    ...filters,
                    priceRange: [priceStats.min, priceStats.max],
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors group"
              >
                ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
