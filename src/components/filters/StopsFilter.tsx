"use client";

import { Plane, Clock } from "lucide-react";
import { Flight } from "@/lib/types";
import { CustomCheckbox } from "./CustomCheckbox";

// Get max stops for a flight (considers return flight for round trips)
function getMaxStops(flight: Flight): number {
  if (flight.returnFlight) {
    return Math.max(flight.stops, flight.returnFlight.stops);
  }
  return flight.stops;
}

interface StopsFilterProps {
  flights: Flight[];
  selectedStops: number[];
  onStopChange: (stop: number) => void;
}

export function StopsFilter({
  flights,
  selectedStops,
  onStopChange,
}: StopsFilterProps) {
  // Use max stops across outbound and return for round trips
  const availableStops = Array.from(new Set(flights.map(getMaxStops))).sort();

  const getStopLabel = (stop: number) => {
    if (stop === 0) return "Nonstop";
    if (stop === 1) return "1 stop";
    return `${stop}+ stops`;
  };

  const getStopIcon = (stop: number) => {
    if (stop === 0) return <Plane className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-orange-500" />;
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Stops</h4>
      <div className="space-y-2">
        {availableStops.map((stop) => {
          const count = flights.filter((f) => getMaxStops(f) === stop).length;
          return (
            <CustomCheckbox
              key={stop}
              checked={selectedStops.includes(stop)}
              onChange={() => onStopChange(stop)}
              label={getStopLabel(stop)}
              count={count}
              icon={getStopIcon(stop)}
            />
          );
        })}
      </div>
    </div>
  );
}
