import { NextResponse } from "next/server";
import { searchFlights, FlightOffer } from "@/lib/amadeus";
import { Flight } from "@/lib/types";

function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  return `${hours}h ${minutes}m`;
}

function transformFlightOffer(
  offer: FlightOffer,
  carriers: Record<string, string>,
  aircraft: Record<string, string>
): Flight {
  const outbound = offer.itineraries[0];
  const firstSegment = outbound.segments[0];
  const lastSegment = outbound.segments[outbound.segments.length - 1];

  const flight: Flight = {
    id: offer.id,
    airline: carriers[firstSegment.carrierCode] || firstSegment.carrierCode,
    airlineCode: firstSegment.carrierCode,
    flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
    departure: {
      airport: firstSegment.departure.iataCode,
      time: firstSegment.departure.at,
      terminal: firstSegment.departure.terminal,
    },
    arrival: {
      airport: lastSegment.arrival.iataCode,
      time: lastSegment.arrival.at,
      terminal: lastSegment.arrival.terminal,
    },
    duration: parseDuration(outbound.duration),
    stops: outbound.segments.length - 1,
    price: parseFloat(offer.price.total),
    currency: offer.price.currency,
    aircraft: aircraft[firstSegment.aircraft.code] || firstSegment.aircraft.code,
    seatsAvailable: offer.numberOfBookableSeats,
  };

  if (offer.itineraries.length > 1) {
    const returnItinerary = offer.itineraries[1];
    const returnFirstSegment = returnItinerary.segments[0];
    const returnLastSegment = returnItinerary.segments[returnItinerary.segments.length - 1];

    flight.returnFlight = {
      airline: carriers[returnFirstSegment.carrierCode] || returnFirstSegment.carrierCode,
      airlineCode: returnFirstSegment.carrierCode,
      flightNumber: `${returnFirstSegment.carrierCode}${returnFirstSegment.number}`,
      departure: {
        airport: returnFirstSegment.departure.iataCode,
        time: returnFirstSegment.departure.at,
        terminal: returnFirstSegment.departure.terminal,
      },
      arrival: {
        airport: returnLastSegment.arrival.iataCode,
        time: returnLastSegment.arrival.at,
        terminal: returnLastSegment.arrival.terminal,
      },
      duration: parseDuration(returnItinerary.duration),
      stops: returnItinerary.segments.length - 1,
      aircraft: aircraft[returnFirstSegment.aircraft.code] || returnFirstSegment.aircraft.code,
    };
  }

  return flight;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departureDate = searchParams.get("departureDate");
  const returnDate = searchParams.get("returnDate");
  const adults = searchParams.get("adults");
  const children = searchParams.get("children");
  const infants = searchParams.get("infants");

  // API-level filter parameters
  const nonStop = searchParams.get("nonStop");
  const maxPrice = searchParams.get("maxPrice");
  const includedAirlineCodes = searchParams.get("includedAirlineCodes");

  if (!origin || !destination || !departureDate || !adults) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const originCode = origin.toUpperCase().trim();
  const destinationCode = destination.toUpperCase().trim();

  if (!/^[A-Z]{3}$/.test(originCode) || !/^[A-Z]{3}$/.test(destinationCode)) {
    return NextResponse.json(
      { error: "Invalid airport code. Please use 3-letter IATA codes." },
      { status: 400 }
    );
  }

  if (originCode === destinationCode) {
    return NextResponse.json(
      { error: "Origin and destination cannot be the same" },
      { status: 400 }
    );
  }

  const departureDateObj = new Date(departureDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(departureDateObj.getTime())) {
    return NextResponse.json(
      { error: "Invalid departure date format" },
      { status: 400 }
    );
  }

  if (departureDateObj < today) {
    return NextResponse.json(
      { error: "Departure date cannot be in the past" },
      { status: 400 }
    );
  }

  if (returnDate) {
    const returnDateObj = new Date(returnDate);
    if (isNaN(returnDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid return date format" },
        { status: 400 }
      );
    }
    if (returnDateObj < departureDateObj) {
      return NextResponse.json(
        { error: "Return date cannot be before departure date" },
        { status: 400 }
      );
    }
  }

  const adultsNum = parseInt(adults);
  const childrenNum = children ? parseInt(children) : 0;
  const infantsNum = infants ? parseInt(infants) : 0;
  const totalPassengers = adultsNum + childrenNum + infantsNum;

  if (isNaN(adultsNum) || adultsNum < 1) {
    return NextResponse.json(
      { error: "At least 1 adult is required" },
      { status: 400 }
    );
  }

  if (totalPassengers > 9) {
    return NextResponse.json(
      { error: "Total passengers cannot exceed 9" },
      { status: 400 }
    );
  }

  if (infantsNum > adultsNum) {
    return NextResponse.json(
      { error: "Each infant must be accompanied by an adult" },
      { status: 400 }
    );
  }

  try {
    const response = await searchFlights({
      origin: originCode,
      destination: destinationCode,
      departureDate,
      returnDate: returnDate || undefined,
      adults: adultsNum,
      children: childrenNum,
      infants: infantsNum,
      // API-level filters
      nonStop: nonStop === "true",
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      includedAirlineCodes: includedAirlineCodes ? includedAirlineCodes.split(",").filter(Boolean) : undefined,
    });

    const carriers = response.dictionaries?.carriers || {};
    const aircraft = response.dictionaries?.aircraft || {};

    const flights = response.data.map((offer) =>
      transformFlightOffer(offer, carriers, aircraft)
    );

    return NextResponse.json({ flights, carriers });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to search flights" },
      { status: 500 }
    );
  }
}
