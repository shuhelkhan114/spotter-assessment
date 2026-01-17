"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CustomCheckbox } from "./CustomCheckbox";

interface Airline {
  code: string;
  name: string;
  count: number;
}

interface AirlinesFilterProps {
  airlines: Airline[];
  selectedAirlines: string[];
  onAirlineChange: (code: string) => void;
}

const AIRLINES_INITIAL_SHOW = 4;

export function AirlinesFilter({
  airlines,
  selectedAirlines,
  onAirlineChange,
}: AirlinesFilterProps) {
  const [showAll, setShowAll] = useState(false);

  if (airlines.length === 0) return null;

  const displayedAirlines = showAll
    ? airlines
    : airlines.slice(0, AIRLINES_INITIAL_SHOW);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Airlines</h4>
        <span className="text-xs text-gray-400">{airlines.length} available</span>
      </div>
      <div className="space-y-2">
        {displayedAirlines.map((airline) => (
          <CustomCheckbox
            key={airline.code}
            checked={selectedAirlines.includes(airline.code)}
            onChange={() => onAirlineChange(airline.code)}
            label={airline.name}
            count={airline.count}
          />
        ))}
      </div>
      {airlines.length > AIRLINES_INITIAL_SHOW && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              See all ({airlines.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}
