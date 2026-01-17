"use client";

import { useState } from "react";
import { Flight } from "@/lib/types";
import { Plane, Clock, ChevronDown, Luggage, Wifi, UtensilsCrossed, Armchair, AlertCircle, Check, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface FlightCardProps {
  flight: Flight;
}

function formatTime(dateString: string): string {
  return format(new Date(dateString), "HH:mm");
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), "EEE, MMM d");
}

function formatShortDate(dateString: string): string {
  return format(new Date(dateString), "MMM d");
}

function getStopsText(stops: number): string {
  if (stops === 0) return "Nonstop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

function parseDuration(duration: string): { hours: number; minutes: number } {
  const match = duration.match(/(\d+)h\s*(\d+)?m?/);
  if (match) {
    return {
      hours: parseInt(match[1]) || 0,
      minutes: parseInt(match[2]) || 0,
    };
  }
  return { hours: 0, minutes: 0 };
}

// Flight segment component for cleaner code
function FlightSegment({
  departure,
  arrival,
  duration,
  stops,
  isReturn = false,
}: {
  departure: { airport: string; time: string; terminal?: string };
  arrival: { airport: string; time: string; terminal?: string };
  duration: string;
  stops: number;
  isReturn?: boolean;
}) {
  const { hours, minutes } = parseDuration(duration);

  return (
    <div className="flex items-center gap-3 sm:gap-6">
      {/* Departure */}
      <div className="min-w-[70px] sm:min-w-[90px]">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {formatTime(departure.time)}
        </div>
        <div className="text-sm font-medium text-gray-700">{departure.airport}</div>
        {departure.terminal && (
          <div className="text-xs text-gray-400">Terminal {departure.terminal}</div>
        )}
      </div>

      {/* Flight path visualization */}
      <div className="flex-1 py-2">
        <div className="relative">
          {/* Duration badge */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full">
            <span className="text-xs font-medium text-gray-500 bg-white px-2">
              {hours}h {minutes > 0 ? `${minutes}m` : ""}
            </span>
          </div>

          {/* Flight line */}
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-100" />
            <div className="flex-1 relative h-0.5 mx-1">
              <div className={`absolute inset-0 ${isReturn ? "bg-gradient-to-r from-indigo-400 to-indigo-500" : "bg-gradient-to-r from-blue-400 to-blue-500"}`} />
              {/* Stop indicators */}
              {stops > 0 && (
                <div className="absolute inset-0 flex items-center justify-center gap-1">
                  {Array.from({ length: Math.min(stops, 2) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-orange-400 ring-2 ring-white"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className={`relative ${isReturn ? "-rotate-180" : ""}`}>
              <Plane className={`w-4 h-4 ${isReturn ? "text-indigo-500" : "text-blue-500"} rotate-90`} />
            </div>
            <div className="flex-1 relative h-0.5 mx-1">
              <div className={`absolute inset-0 ${isReturn ? "bg-gradient-to-r from-indigo-500 to-indigo-400" : "bg-gradient-to-r from-blue-500 to-blue-400"}`} />
            </div>
            <div className={`w-2 h-2 rounded-full ${isReturn ? "bg-indigo-500 ring-2 ring-indigo-100" : "bg-blue-500 ring-2 ring-blue-100"}`} />
          </div>

          {/* Stops text */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 translate-y-full">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              stops === 0
                ? "text-green-700 bg-green-50"
                : "text-orange-700 bg-orange-50"
            }`}>
              {getStopsText(stops)}
            </span>
          </div>
        </div>
      </div>

      {/* Arrival */}
      <div className="min-w-[70px] sm:min-w-[90px] text-right">
        <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {formatTime(arrival.time)}
        </div>
        <div className="text-sm font-medium text-gray-700">{arrival.airport}</div>
        {arrival.terminal && (
          <div className="text-xs text-gray-400">Terminal {arrival.terminal}</div>
        )}
      </div>
    </div>
  );
}

export default function FlightCard({ flight }: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const urgencyLevel = flight.seatsAvailable <= 3 ? "critical" : flight.seatsAvailable <= 5 ? "warning" : null;

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 cursor-pointer group ${
      urgencyLevel === "critical"
        ? "border-red-200 hover:border-red-300"
        : urgencyLevel === "warning"
        ? "border-orange-200 hover:border-orange-300"
        : "border-gray-100 hover:border-blue-200"
    } hover:shadow-xl hover:shadow-blue-900/5`}>
      {/* Urgency banner */}
      {urgencyLevel && (
        <div className={`px-4 py-1.5 flex items-center gap-2 text-xs font-medium ${
          urgencyLevel === "critical"
            ? "bg-red-50 text-red-700"
            : "bg-orange-50 text-orange-700"
        }`}>
          <AlertCircle className="w-3.5 h-3.5" />
          {urgencyLevel === "critical"
            ? `Only ${flight.seatsAvailable} seats left at this price!`
            : `${flight.seatsAvailable} seats remaining`
          }
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Airline info */}
          <div className="flex items-center gap-3 lg:min-w-[160px]">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
              <span className="text-sm font-bold text-gray-700">{flight.airlineCode}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">{flight.airline}</div>
              <div className="text-xs text-gray-500">{flight.flightNumber}</div>
              <div className="text-xs text-gray-400 mt-0.5">{formatShortDate(flight.departure.time)}</div>
            </div>
          </div>

          {/* Flight details */}
          <div className="flex-1 space-y-4">
            {/* Outbound flight */}
            <FlightSegment
              departure={flight.departure}
              arrival={flight.arrival}
              duration={flight.duration}
              stops={flight.stops}
            />

            {/* Return flight */}
            {flight.returnFlight && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-gray-400 font-medium">Return</span>
                  </div>
                </div>
                <FlightSegment
                  departure={flight.returnFlight.departure}
                  arrival={flight.returnFlight.arrival}
                  duration={flight.returnFlight.duration}
                  stops={flight.returnFlight.stops}
                  isReturn
                />
              </>
            )}
          </div>

          {/* Price and CTA */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6 lg:min-w-[140px]">
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-0.5">from</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                <span className="text-lg align-top">$</span>
                {flight.price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">per person</div>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all duration-150 shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/30 flex items-center gap-2 cursor-pointer">
              Select
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Expandable details section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{flight.duration}</span>
                {flight.returnFlight && (
                  <span className="text-gray-400">+ {flight.returnFlight.duration} return</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Armchair className="w-4 h-4 text-gray-400" />
                <span>{flight.aircraft}</span>
              </div>
              {/* Amenity icons */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-1 text-gray-400" title="WiFi available">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1 text-gray-400" title="Meals included">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1 text-gray-400" title="Carry-on included">
                  <Luggage className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-600 font-medium">
              <span>{isExpanded ? "Less" : "Details"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Flight info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flight Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Aircraft</span>
                      <span className="font-medium text-gray-900">{flight.aircraft}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Flight Number</span>
                      <span className="font-medium text-gray-900">{flight.flightNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Operated by</span>
                      <span className="font-medium text-gray-900">{flight.airline}</span>
                    </div>
                    {flight.departure.terminal && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Departure Terminal</span>
                        <span className="font-medium text-gray-900">{flight.departure.terminal}</span>
                      </div>
                    )}
                    {flight.arrival.terminal && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Arrival Terminal</span>
                        <span className="font-medium text-gray-900">{flight.arrival.terminal}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Included Amenities</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Personal item included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Carry-on bag included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">In-flight entertainment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Complimentary snacks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return flight details */}
              {flight.returnFlight && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Return Flight Details</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-sm">
                      <span className="text-gray-500 block">Flight</span>
                      <span className="font-medium text-gray-900">{flight.returnFlight.flightNumber}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 block">Aircraft</span>
                      <span className="font-medium text-gray-900">{flight.returnFlight.aircraft}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 block">Duration</span>
                      <span className="font-medium text-gray-900">{flight.returnFlight.duration}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 block">Date</span>
                      <span className="font-medium text-gray-900">{formatDate(flight.returnFlight.departure.time)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
