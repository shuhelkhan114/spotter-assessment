const AMADEUS_API_URL = "https://test.api.amadeus.com";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch(`${AMADEUS_API_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID || "",
      client_secret: process.env.AMADEUS_CLIENT_SECRET || "",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get Amadeus access token");
  }

  const data = await response.json();
  accessToken = data.access_token as string;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;

  return accessToken as string;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  nonStop?: boolean;
}

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

export async function searchAirports(keyword: string): Promise<AirportSearchResponse> {
  const token = await getAccessToken();

  const searchParams = new URLSearchParams({
    subType: "AIRPORT,CITY",
    keyword: keyword,
    "page[limit]": "10",
    sort: "analytics.travelers.score",
    view: "LIGHT",
  });

  const response = await fetch(
    `${AMADEUS_API_URL}/v1/reference-data/locations?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.errors?.[0]?.detail || "Failed to search airports");
  }

  return response.json();
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResponse> {
  const token = await getAccessToken();

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

  const response = await fetch(
    `${AMADEUS_API_URL}/v2/shopping/flight-offers?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.errors?.[0]?.detail || "Failed to search flights");
  }

  return response.json();
}
