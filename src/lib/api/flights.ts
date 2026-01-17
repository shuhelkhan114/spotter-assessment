import { apiClient } from "./client";
import { Flight } from "@/lib/types";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  nonStop?: boolean;
  maxPrice?: number;
  includedAirlineCodes?: string[];
}

export interface FlightSearchResponse {
  flights: Flight[];
  carriers: Record<string, string>;
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResponse> {
  const searchParams = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    departureDate: params.departureDate,
    adults: params.adults.toString(),
  });

  if (params.returnDate) {
    searchParams.append("returnDate", params.returnDate);
  }

  if (params.children && params.children > 0) {
    searchParams.append("children", params.children.toString());
  }

  if (params.infants && params.infants > 0) {
    searchParams.append("infants", params.infants.toString());
  }

  if (params.nonStop) {
    searchParams.append("nonStop", "true");
  }

  if (params.maxPrice && params.maxPrice > 0) {
    searchParams.append("maxPrice", params.maxPrice.toString());
  }

  if (params.includedAirlineCodes && params.includedAirlineCodes.length > 0) {
    searchParams.append(
      "includedAirlineCodes",
      params.includedAirlineCodes.join(",")
    );
  }

  const response = await apiClient.get<FlightSearchResponse>(
    `/flights?${searchParams.toString()}`
  );

  return response.data;
}
