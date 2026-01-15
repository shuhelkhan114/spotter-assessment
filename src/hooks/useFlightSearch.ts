"use client";

import { useState, useCallback } from "react";
import { Flight, SearchParams } from "@/lib/types";

interface UseFlightSearchReturn {
  flights: Flight[];
  carriers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  search: (params: SearchParams) => Promise<void>;
}

export function useFlightSearch(): UseFlightSearchReturn {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [carriers, setCarriers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        adults: params.passengers.adults.toString(),
      });

      if (params.passengers.children > 0) {
        searchParams.append("children", params.passengers.children.toString());
      }

      if (params.passengers.infants > 0) {
        searchParams.append("infants", params.passengers.infants.toString());
      }

      if (params.tripType === "roundtrip" && params.returnDate) {
        searchParams.append("returnDate", params.returnDate);
      }

      const response = await fetch(`/api/flights?${searchParams.toString()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to search flights");
      }

      const data = await response.json();
      setFlights(data.flights);
      setCarriers(data.carriers || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { flights, carriers, isLoading, error, search };
}
