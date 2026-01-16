export interface Passengers {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: Passengers;
  tripType: "roundtrip" | "oneway";
  // API-level filters (optional)
  nonStop?: boolean;
  maxPrice?: number;
  includedAirlineCodes?: string[];
}

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: {
    airport: string;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    time: string;
    terminal?: string;
  };
  duration: string;
  stops: number;
  price: number;
  currency: string;
  aircraft: string;
  seatsAvailable: number;
  returnFlight?: {
    airline: string;
    airlineCode: string;
    flightNumber: string;
    departure: {
      airport: string;
      time: string;
      terminal?: string;
    };
    arrival: {
      airport: string;
      time: string;
      terminal?: string;
    };
    duration: string;
    stops: number;
    aircraft: string;
  };
}

export interface FlightFilters {
  stops: number[];
  priceRange: [number, number];
  airlines: string[];
}
