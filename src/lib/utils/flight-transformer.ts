import { Flight } from "@/lib/types";
import { FlightOffer } from "@/lib/api/amadeus-service";

export function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return duration;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  return `${hours}h ${minutes}m`;
}

export function transformFlightOffer(
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
    aircraft:
      aircraft[firstSegment.aircraft.code] || firstSegment.aircraft.code,
    seatsAvailable: offer.numberOfBookableSeats,
  };

  if (offer.itineraries.length > 1) {
    const returnItinerary = offer.itineraries[1];
    const returnFirstSegment = returnItinerary.segments[0];
    const returnLastSegment =
      returnItinerary.segments[returnItinerary.segments.length - 1];

    flight.returnFlight = {
      airline:
        carriers[returnFirstSegment.carrierCode] ||
        returnFirstSegment.carrierCode,
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
      aircraft:
        aircraft[returnFirstSegment.aircraft.code] ||
        returnFirstSegment.aircraft.code,
    };
  }

  return flight;
}
