import { apiClient } from "./client";

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  type: string;
}

export interface AirportSearchResponse {
  airports: Airport[];
}

export async function searchAirports(
  keyword: string
): Promise<AirportSearchResponse> {
  const response = await apiClient.get<AirportSearchResponse>(
    `/airports?keyword=${encodeURIComponent(keyword)}`
  );

  return response.data;
}
