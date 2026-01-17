"use client";

import { useMutation } from "@tanstack/react-query";
import {
  searchFlights,
  FlightSearchParams,
  FlightSearchResponse,
} from "@/lib/api/flights";
import { SearchParams } from "@/lib/types";

// Transform SearchParams (from form) to FlightSearchParams (for API)
function transformToApiParams(params: SearchParams): FlightSearchParams {
  return {
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    returnDate: params.returnDate || undefined,
    adults: params.passengers.adults,
    children: params.passengers.children,
    infants: params.passengers.infants,
    nonStop: params.nonStop,
    maxPrice: params.maxPrice,
    includedAirlineCodes: params.includedAirlineCodes,
  };
}

export function useFlightSearch() {
  const mutation = useMutation<FlightSearchResponse, Error, SearchParams>({
    mutationFn: (params) => searchFlights(transformToApiParams(params)),
  });

  return {
    flights: mutation.data?.flights || [],
    carriers: mutation.data?.carriers || {},
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    search: mutation.mutate,
    reset: mutation.reset,
  };
}
