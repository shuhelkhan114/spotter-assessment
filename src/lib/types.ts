export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  duration: string;
  numberOfStops: number;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface FlightPrice {
  currency: string;
  total: string;
  base: string;
  grandTotal: string;
}

export interface FlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  itineraries: FlightItinerary[];
  price: FlightPrice;
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  nonStop?: boolean;
}

export interface FilterState {
  stops: number[];
  priceRange: [number, number];
  airlines: string[];
}

export interface AirlineInfo {
  code: string;
  name: string;
}
