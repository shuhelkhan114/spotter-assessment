import { amadeusClient } from "./amadeus-client";
import { FlightSearchInput } from "../validations/schemas";

// Types
export interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      arrival: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      duration: string;
      numberOfStops: number;
    }>;
  }>;
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  dictionaries?: {
    carriers: Record<string, string>;
    aircraft: Record<string, string>;
  };
}

export interface AirportLocation {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  iataCode: string;
  address: {
    cityName: string;
    cityCode: string;
    countryName: string;
    countryCode: string;
  };
}

export interface AirportSearchResponse {
  data: AirportLocation[];
}

// Airport search
export async function searchAirports(
  keyword: string
): Promise<AirportSearchResponse> {
  const params = new URLSearchParams({
    subType: "AIRPORT,CITY",
    keyword: keyword,
    "page[limit]": "10",
    sort: "analytics.travelers.score",
    view: "LIGHT",
  });

  const response = await amadeusClient.get<AirportSearchResponse>(
    `/v1/reference-data/locations?${params.toString()}`
  );

  return response.data;
}

// Flight search
export async function searchFlights(
  params: FlightSearchInput
): Promise<FlightSearchResponse> {
  const searchParams = new URLSearchParams({
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: params.adults.toString(),
    currencyCode: "USD",
    max: "50",
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

  const response = await amadeusClient.get<FlightSearchResponse>(
    `/v2/shopping/flight-offers?${searchParams.toString()}`
  );

  return response.data;
}
