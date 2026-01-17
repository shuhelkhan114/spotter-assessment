"use client";

import { useState } from "react";
import { ArrowRightLeft, Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { SearchParams, Passengers } from "@/lib/types";
import { Airport } from "@/hooks/useAirportSearch";
import {
  AirportInput,
  DatePickerInput,
  PassengerSelector,
  TripTypeToggle,
} from "./search-form";

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  compact?: boolean;
  initialValues?: SearchParams | null;
}

export default function SearchForm({
  onSearch,
  isLoading,
  compact = false,
  initialValues,
}: SearchFormProps) {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">(
    initialValues?.tripType || "roundtrip"
  );
  const [origin, setOrigin] = useState(initialValues?.origin || "");
  const [destination, setDestination] = useState(initialValues?.destination || "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialValues?.departureDate) {
      return {
        from: new Date(initialValues.departureDate),
        to: initialValues.returnDate
          ? new Date(initialValues.returnDate)
          : undefined,
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  // Track last synced initialValues to detect changes
  const [lastInitialValuesKey, setLastInitialValuesKey] = useState(() =>
    initialValues ? `${initialValues.origin}-${initialValues.destination}-${initialValues.departureDate}` : ""
  );

  // Sync state when initialValues change
  const currentInitialValuesKey = initialValues
    ? `${initialValues.origin}-${initialValues.destination}-${initialValues.departureDate}`
    : "";

  if (initialValues && currentInitialValuesKey !== lastInitialValuesKey && lastInitialValuesKey === "") {
    setLastInitialValuesKey(currentInitialValuesKey);
    setTripType(initialValues.tripType);
    setOrigin(initialValues.origin);
    setDestination(initialValues.destination);
    setPassengers(initialValues.passengers);
    if (initialValues.tripType === "roundtrip") {
      setDateRange({
        from: new Date(initialValues.departureDate),
        to: initialValues.returnDate
          ? new Date(initialValues.returnDate)
          : undefined,
      });
    } else {
      setSingleDate(new Date(initialValues.departureDate));
    }
  }

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSelectOrigin = (airport: Airport) => {
    setOrigin(airport.code);
  };

  const handleSelectDestination = (airport: Airport) => {
    setDestination(airport.code);
  };

  const updatePassengers = (type: keyof Passengers, delta: number) => {
    setPassengers((prev) => {
      const newValue = prev[type] + delta;
      const otherPassengers =
        type === "adults"
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
    const departureDate =
      tripType === "roundtrip" ? dateRange?.from : singleDate;
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
      >
        {/* Origin/Destination row */}
        <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
          <AirportInput
            value={origin}
            onChange={setOrigin}
            onSelect={handleSelectOrigin}
            placeholder="From"
            variant="origin"
            compact
          />

          <button
            type="button"
            onClick={handleSwapLocations}
            className="hidden sm:flex w-8 h-8 bg-gray-100 rounded-lg items-center justify-center hover:bg-gray-200 transition-colors self-center shrink-0 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>

          <AirportInput
            value={destination}
            onChange={setDestination}
            onSelect={handleSelectDestination}
            placeholder="To"
            variant="destination"
            compact
          />
        </div>

        {/* Date and Passengers row - full width on mobile */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <DatePickerInput
            tripType={tripType}
            dateRange={dateRange}
            singleDate={singleDate}
            onDateRangeChange={setDateRange}
            onSingleDateChange={setSingleDate}
            showPicker={showDatePicker}
            onTogglePicker={() => setShowDatePicker(!showDatePicker)}
            onClose={() => setShowDatePicker(false)}
            compact
          />

          <PassengerSelector
            passengers={passengers}
            onUpdate={updatePassengers}
            showDropdown={showPassengerDropdown}
            onToggle={() => setShowPassengerDropdown(!showPassengerDropdown)}
            onClose={() => setShowPassengerDropdown(false)}
            compact
          />
        </div>

        {/* Search button - full width on mobile */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/20"
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
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200/50 p-6 shadow-2xl shadow-gray-900/10"
    >
      <TripTypeToggle value={tripType} onChange={setTripType} />

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 relative">
          <AirportInput
            value={origin}
            onChange={setOrigin}
            onSelect={handleSelectOrigin}
            placeholder="City or airport"
            label="From"
            variant="origin"
          />

          <button
            type="button"
            onClick={handleSwapLocations}
            className="hidden sm:flex absolute left-1/2 top-[30px] -translate-x-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Swap locations"
          >
            <ArrowRightLeft className="w-4 h-4 text-gray-600" />
          </button>

          <AirportInput
            value={destination}
            onChange={setDestination}
            onSelect={handleSelectDestination}
            placeholder="City or airport"
            label="To"
            variant="destination"
          />
        </div>

        <DatePickerInput
          tripType={tripType}
          dateRange={dateRange}
          singleDate={singleDate}
          onDateRangeChange={setDateRange}
          onSingleDateChange={setSingleDate}
          showPicker={showDatePicker}
          onTogglePicker={() => setShowDatePicker(!showDatePicker)}
          onClose={() => setShowDatePicker(false)}
          label="Dates"
        />

        <PassengerSelector
          passengers={passengers}
          onUpdate={updatePassengers}
          showDropdown={showPassengerDropdown}
          onToggle={() => setShowPassengerDropdown(!showPassengerDropdown)}
          onClose={() => setShowPassengerDropdown(false)}
          label="Travelers"
        />

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
