"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, MapPin, Users, ArrowRightLeft, Search, ChevronDown, Loader2, Plane, Building2 } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { SearchParams, Passengers } from "@/lib/types";
import { useAirportSearch, Airport } from "@/hooks/useAirportSearch";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  compact?: boolean;
  initialValues?: SearchParams | null;
}

export default function SearchForm({ onSearch, isLoading, compact = false, initialValues }: SearchFormProps) {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">(initialValues?.tripType || "roundtrip");
  const [origin, setOrigin] = useState(initialValues?.origin || "");
  const [destination, setDestination] = useState(initialValues?.destination || "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialValues?.departureDate) {
      return {
        from: new Date(initialValues.departureDate),
        to: initialValues.returnDate ? new Date(initialValues.returnDate) : undefined,
      };
    }
    return undefined;
  });
  const [singleDate, setSingleDate] = useState<Date | undefined>(() => {
    if (initialValues?.tripType === "oneway" && initialValues?.departureDate) {
      return new Date(initialValues.departureDate);
    }
    return undefined;
  });
  const [passengers, setPassengers] = useState<Passengers>(
    initialValues?.passengers || { adults: 1, children: 0, infants: 0 }
  );
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Airport search hooks
  const originSearch = useAirportSearch();
  const destinationSearch = useAirportSearch();

  // Handle origin input change
  const handleOriginChange = (value: string) => {
    setOrigin(value);
    originSearch.search(value);
  };

  // Handle destination input change
  const handleDestinationChange = (value: string) => {
    setDestination(value);
    destinationSearch.search(value);
  };

  // Select airport for origin
  const selectOriginAirport = (airport: Airport) => {
    setOrigin(airport.code);
    setShowOriginDropdown(false);
    originSearch.clear();
  };

  // Select airport for destination
  const selectDestinationAirport = (airport: Airport) => {
    setDestination(airport.code);
    setShowDestinationDropdown(false);
    destinationSearch.clear();
  };

  useEffect(() => {
    if (initialValues && !initializedRef.current) {
      setTripType(initialValues.tripType);
      setOrigin(initialValues.origin);
      setDestination(initialValues.destination);
      setPassengers(initialValues.passengers);
      if (initialValues.tripType === "roundtrip") {
        setDateRange({
          from: new Date(initialValues.departureDate),
          to: initialValues.returnDate ? new Date(initialValues.returnDate) : undefined,
        });
      } else {
        setSingleDate(new Date(initialValues.departureDate));
      }
      initializedRef.current = true;
    }
  }, [initialValues]);

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

  const getTotalPassengers = () => {
    return passengers.adults + passengers.children + passengers.infants;
  };

  const getPassengerDisplayText = () => {
    const total = getTotalPassengers();
    if (total === 1) return "1 Traveler";
    return `${total} Travelers`;
  };

  const updatePassengers = (type: keyof Passengers, delta: number) => {
    setPassengers((prev) => {
      const newValue = prev[type] + delta;
      const otherPassengers = type === "adults"
        ? prev.children + prev.infants
        : type === "children"
        ? prev.adults + prev.infants
        : prev.adults + prev.children;

      if (type === "adults") {
        if (newValue < 1) return prev;
        if (newValue + otherPassengers > 9) return prev;
        if (newValue < prev.infants) return prev;
      } else if (type === "children") {
        if (newValue < 0) return prev;
        if (newValue + otherPassengers > 9) return prev;
      } else {
        if (newValue < 0) return prev;
        if (newValue > prev.adults) return prev;
        if (newValue + otherPassengers > 9) return prev;
      }

      return { ...prev, [type]: newValue };
    });
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

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-center gap-3">
        <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              <input
                type="text"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => setShowOriginDropdown(true)}
                onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                placeholder="From"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                required
              />
              {originSearch.isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            {showOriginDropdown && originSearch.airports.length > 0 && (
              <div className="absolute z-50 min-w-[340px] mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
                {originSearch.airports.slice(0, 10).map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => selectOriginAirport(airport)}
                    className="w-full px-3 py-2.5 text-left hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      airport.type === "AIRPORT" ? "bg-blue-50" : "bg-purple-50"
                    }`}>
                      {airport.type === "AIRPORT" ? (
                        <Plane className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{airport.name}</div>
                      <div className="text-xs text-gray-500">{airport.city}</div>
                    </div>
                    <div className="font-bold text-blue-600 text-sm shrink-0">{airport.code}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSwapLocations}
            className="hidden sm:flex w-8 h-8 bg-gray-100 rounded-lg items-center justify-center hover:bg-gray-200 transition-colors self-center shrink-0 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>

          <div className="relative flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onFocus={() => setShowDestinationDropdown(true)}
                onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                placeholder="To"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                required
              />
              {destinationSearch.isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            {showDestinationDropdown && destinationSearch.airports.length > 0 && (
              <div className="absolute z-50 min-w-[340px] mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
                {destinationSearch.airports.slice(0, 10).map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => selectDestinationAirport(airport)}
                    className="w-full px-3 py-2.5 text-left hover:bg-indigo-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      airport.type === "AIRPORT" ? "bg-indigo-50" : "bg-purple-50"
                    }`}>
                      {airport.type === "AIRPORT" ? (
                        <Plane className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{airport.name}</div>
                      <div className="text-xs text-gray-500">{airport.city}</div>
                    </div>
                    <div className="font-bold text-indigo-600 text-sm shrink-0">{airport.code}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-400 transition-all text-sm whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className={dateRange?.from || singleDate ? "text-gray-900" : "text-gray-500"}>
              {getDateDisplayText()}
            </span>
          </button>
          {showDatePicker && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 right-0">
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
          <button
            type="button"
            onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-400 transition-all text-sm whitespace-nowrap cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-500" />
            <span className="text-gray-900">{getPassengerDisplayText()}</span>
          </button>
          {showPassengerDropdown && (
            <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 right-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Adults</div>
                    <div className="text-xs text-gray-500">Age 12+</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePassengers("adults", -1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      disabled={passengers.adults <= 1 || passengers.adults <= passengers.infants}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{passengers.adults}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers("adults", 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      disabled={getTotalPassengers() >= 9}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Children</div>
                    <div className="text-xs text-gray-500">Age 2-11</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePassengers("children", -1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      disabled={passengers.children <= 0}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{passengers.children}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers("children", 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      disabled={getTotalPassengers() >= 9}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Infants</div>
                    <div className="text-xs text-gray-500">Under 2</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePassengers("infants", -1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      disabled={passengers.infants <= 0}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{passengers.infants}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers("infants", 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                      disabled={passengers.infants >= passengers.adults || getTotalPassengers() >= 9}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 text-sm shadow-md shadow-blue-500/20"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>Search</span>
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-2xl shadow-gray-900/10">
      <div className="flex gap-1 mb-6 bg-gray-100/80 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setTripType("roundtrip")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
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
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
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
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => setShowOriginDropdown(true)}
                onBlur={() => setTimeout(() => setShowOriginDropdown(false), 200)}
                placeholder="City or airport"
                className="w-full pl-10 pr-10 py-3 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                required
              />
              {originSearch.isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            {showOriginDropdown && originSearch.airports.length > 0 && (
              <div className="absolute z-20 min-w-[360px] mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
                {originSearch.airports.slice(0, 10).map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => selectOriginAirport(airport)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      airport.type === "AIRPORT" ? "bg-blue-50" : "bg-purple-50"
                    }`}>
                      {airport.type === "AIRPORT" ? (
                        <Plane className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{airport.name}</div>
                      <div className="text-xs text-gray-500">{airport.city}</div>
                    </div>
                    <div className="font-bold text-blue-600 shrink-0">{airport.code}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSwapLocations}
            className="hidden sm:flex absolute left-1/2 top-[30px] -translate-x-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
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
                onChange={(e) => handleDestinationChange(e.target.value)}
                onFocus={() => setShowDestinationDropdown(true)}
                onBlur={() => setTimeout(() => setShowDestinationDropdown(false), 200)}
                placeholder="City or airport"
                className="w-full pl-10 pr-10 py-3 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                required
              />
              {destinationSearch.isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
            {showDestinationDropdown && destinationSearch.airports.length > 0 && (
              <div className="absolute z-20 min-w-[360px] mt-1 bg-white border border-gray-200 rounded-xl shadow-xl">
                {destinationSearch.airports.slice(0, 10).map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => selectDestinationAirport(airport)}
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      airport.type === "AIRPORT" ? "bg-indigo-50" : "bg-purple-50"
                    }`}>
                      {airport.type === "AIRPORT" ? (
                        <Plane className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Building2 className="w-4 h-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{airport.name}</div>
                      <div className="text-xs text-gray-500">{airport.city}</div>
                    </div>
                    <div className="font-bold text-indigo-600 shrink-0">{airport.code}</div>
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
            className="w-full lg:w-64 flex items-center gap-2 px-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all text-left cursor-pointer"
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
            className="w-full lg:w-36 flex items-center gap-2 px-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all text-left cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-sm text-gray-900 flex-1 truncate">{getPassengerDisplayText()}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showPassengerDropdown && (
            <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 right-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Adults</div>
                    <div className="text-xs text-gray-500">Age 12+</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updatePassengers("adults", -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      disabled={passengers.adults <= 1 || passengers.adults <= passengers.infants}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{passengers.adults}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers("adults", 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      disabled={getTotalPassengers() >= 9}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Children</div>
                    <div className="text-xs text-gray-500">Age 2-11</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updatePassengers("children", -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      disabled={passengers.children <= 0}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{passengers.children}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers("children", 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      disabled={getTotalPassengers() >= 9}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Infants</div>
                    <div className="text-xs text-gray-500">Under 2 (on lap)</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updatePassengers("infants", -1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      disabled={passengers.infants <= 0}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{passengers.infants}</span>
                    <button
                      type="button"
                      onClick={() => updatePassengers("infants", 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      disabled={passengers.infants >= passengers.adults || getTotalPassengers() >= 9}
                    >
                      +
                    </button>
                  </div>
                </div>

                {passengers.infants > 0 && (
                  <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Each infant must be accompanied by an adult
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
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
