"use client";

import { Flight } from "@/lib/types";
import FlightCard from "./FlightCard";
import { Plane, AlertCircle } from "lucide-react";

interface FlightListProps {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
}

function FlightSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 lg:w-32">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-14 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="h-6 w-12 bg-gray-200 rounded mb-1 mx-auto" />
              <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="flex-1 flex flex-col items-center px-4">
              <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
              <div className="w-full h-px bg-gray-200" />
              <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
            </div>
            <div className="text-center">
              <div className="h-6 w-12 bg-gray-200 rounded mb-1 mx-auto" />
              <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
          <div>
            <div className="h-7 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-14 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function FlightList({ flights, isLoading, error }: FlightListProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-1">Search Failed</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <FlightSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights found</h3>
        <p className="text-sm text-gray-500">
          Try adjusting your search criteria or selecting different dates.
        </p>
      </div>
    );
  }

  const sortedFlights = [...flights].sort((a, b) => a.price - b.price);
  const cheapestPrice = sortedFlights[0]?.price;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {flights.length} flight{flights.length !== 1 ? "s" : ""} found
        </h3>
        <span className="text-sm text-gray-500">
          Prices from <span className="font-semibold text-gray-900">${cheapestPrice?.toLocaleString()}</span>
        </span>
      </div>
      {sortedFlights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
