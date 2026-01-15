"use client";

import { Flight } from "@/lib/types";
import { Plane, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface FlightCardProps {
  flight: Flight;
}

function formatTime(dateString: string): string {
  return format(new Date(dateString), "HH:mm");
}

function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d");
}

function getStopsText(stops: number): string {
  if (stops === 0) return "Nonstop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

export default function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 lg:w-32">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">{flight.airlineCode}</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{flight.airline}</div>
            <div className="text-xs text-gray-500">{flight.flightNumber}</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{formatTime(flight.departure.time)}</div>
              <div className="text-sm text-gray-600">{flight.departure.airport}</div>
              <div className="text-xs text-gray-400">{formatDate(flight.departure.time)}</div>
            </div>

            <div className="flex-1 flex flex-col items-center px-4">
              <div className="text-xs text-gray-500 mb-1">{flight.duration}</div>
              <div className="w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-300" />
                <Plane className="w-4 h-4 text-blue-500 rotate-90" />
                <div className="flex-1 h-px bg-gray-300" />
              </div>
              <div className={`text-xs mt-1 ${flight.stops === 0 ? "text-green-600" : "text-orange-600"}`}>
                {getStopsText(flight.stops)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{formatTime(flight.arrival.time)}</div>
              <div className="text-sm text-gray-600">{flight.arrival.airport}</div>
              <div className="text-xs text-gray-400">{formatDate(flight.arrival.time)}</div>
            </div>
          </div>

          {flight.returnFlight && (
            <>
              <div className="my-3 border-t border-dashed border-gray-200" />
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{formatTime(flight.returnFlight.departure.time)}</div>
                  <div className="text-sm text-gray-600">{flight.returnFlight.departure.airport}</div>
                  <div className="text-xs text-gray-400">{formatDate(flight.returnFlight.departure.time)}</div>
                </div>

                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="text-xs text-gray-500 mb-1">{flight.returnFlight.duration}</div>
                  <div className="w-full flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-300" />
                    <Plane className="w-4 h-4 text-indigo-500 -rotate-90" />
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>
                  <div className={`text-xs mt-1 ${flight.returnFlight.stops === 0 ? "text-green-600" : "text-orange-600"}`}>
                    {getStopsText(flight.returnFlight.stops)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{formatTime(flight.returnFlight.arrival.time)}</div>
                  <div className="text-sm text-gray-600">{flight.returnFlight.arrival.airport}</div>
                  <div className="text-xs text-gray-400">{formatDate(flight.returnFlight.arrival.time)}</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${flight.price.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">per person</div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
            Select
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{flight.duration} total</span>
        </div>
        <div>{flight.aircraft}</div>
        {flight.seatsAvailable <= 5 && (
          <div className="text-orange-600 font-medium">
            Only {flight.seatsAvailable} seats left
          </div>
        )}
      </div>
    </div>
  );
}
