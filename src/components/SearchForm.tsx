"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, MapPin, Users, ArrowRightLeft, Search, ChevronDown } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  tripType: "roundtrip" | "oneway";
}

const popularAirports = [
  { code: "JFK", name: "John F. Kennedy International", city: "New York" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles" },
  { code: "LHR", name: "Heathrow", city: "London" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris" },
  { code: "DXB", name: "Dubai International", city: "Dubai" },
  { code: "SIN", name: "Changi", city: "Singapore" },
  { code: "HND", name: "Haneda", city: "Tokyo" },
  { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney" },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt" },
  { code: "AMS", name: "Schiphol", city: "Amsterdam" },
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [singleDate, setSingleDate] = useState<Date | undefined>();
  const [passengers, setPassengers] = useState(1);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOriginAirports = popularAirports.filter(
    (airport) =>
      airport.code.toLowerCase().includes(origin.toLowerCase()) ||
      airport.city.toLowerCase().includes(origin.toLowerCase()) ||
      airport.name.toLowerCase().includes(origin.toLowerCase())
  );

  const filteredDestinationAirports = popularAirports.filter(
    (airport) =>
      airport.code.toLowerCase().includes(destination.toLowerCase()) ||
      airport.city.toLowerCase().includes(destination.toLowerCase()) ||
      airport.name.toLowerCase().includes(destination.toLowerCase())
  );

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const getDateDisplayText = () => {
    if (tripType === "roundtrip") {
      if (dateRange?.from && dateRange?.to) {
        return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
      }
      if (dateRange?.from) {
        return `${format(dateRange.from, "MMM d, yyyy")} - Select return`;
      }
    } else {
      if (singleDate) {
        return format(singleDate, "MMM d, yyyy");
      }
    }
    return "Select dates";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const departureDate = tripType === "roundtrip"
      ? dateRange?.from
      : singleDate;
    const returnDate = tripType === "roundtrip" ? dateRange?.to : undefined;

    if (!departureDate) return;

    onSearch({
      origin,
      destination,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      returnDate: returnDate ? format(returnDate, "yyyy-MM-dd") : "",
      passengers,
      tripType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-2xl shadow-gray-900/10">
      <div className="flex gap-1 mb-6 bg-gray-100/80 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setTripType("roundtrip")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tripType === "roundtrip"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Round trip
        </button>
        <button
          type="button"
          onClick={() => setTripType("oneway")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            tripType === "oneway"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          One way
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 relative">
          <div className="relative flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              From
            </label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                onFocus={() => setShowOriginDropdown(true)}
                onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                placeholder="City or airport"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                required
              />
            </div>
            {showOriginDropdown && filteredOriginAirports.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredOriginAirports.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => {
                      setOrigin(airport.code);
                      setShowOriginDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {airport.city} ({airport.code})
                      </div>
                      <div className="text-xs text-gray-500">{airport.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSwapLocations}
            className="hidden sm:flex absolute left-1/2 top-[30px] -translate-x-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Swap locations"
          >
            <ArrowRightLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="relative flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              To
            </label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setShowDestinationDropdown(true)}
                onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                placeholder="City or airport"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                required
              />
            </div>
            {showDestinationDropdown && filteredDestinationAirports.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredDestinationAirports.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => {
                      setDestination(airport.code);
                      setShowDestinationDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {airport.city} ({airport.code})
                      </div>
                      <div className="text-xs text-gray-500">{airport.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative" ref={datePickerRef}>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
            {tripType === "roundtrip" ? "Dates" : "Departure"}
          </label>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full lg:w-64 flex items-center gap-2 px-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all text-left"
          >
            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
            <span className={`text-sm flex-1 truncate whitespace-nowrap ${dateRange?.from || singleDate ? "text-gray-900" : "text-gray-500"}`}>
              {getDateDisplayText()}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          {showDatePicker && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 right-0 lg:right-auto">
              {tripType === "roundtrip" ? (
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={{ before: new Date() }}
                  className="!font-sans"
                />
              ) : (
                <DayPicker
                  mode="single"
                  selected={singleDate}
                  onSelect={setSingleDate}
                  disabled={{ before: new Date() }}
                  className="!font-sans"
                />
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={passengerRef}>
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
            Travelers
          </label>
          <button
            type="button"
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            className="w-full lg:w-32 flex items-center gap-2 px-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all text-left"
          >
            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-sm text-gray-900 flex-1">{passengers}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showPassengerDropdown && (
            <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg p-4 right-0">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-700 whitespace-nowrap">Passengers</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                    disabled={passengers <= 1}
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{passengers}</span>
                  <button
                    type="button"
                    onClick={() => setPassengers(Math.min(9, passengers + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                    disabled={passengers >= 9}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 animate-pulse-glow"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
