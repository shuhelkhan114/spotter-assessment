"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import FlightList from "@/components/FlightList";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { Plane, Sparkles } from "lucide-react";
import { SearchParams } from "@/lib/types";

export default function Home() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const { flights, isLoading, error, search } = useFlightSearch();

  const handleSearch = async (params: SearchParams) => {
    setSearchParams(params);
    await search(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-4 border border-white/30">
          <Sparkles className="w-4 h-4" />
          <span>Find the best deals on flights</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
          Where would you like to{" "}
          <span className="text-blue-200">
            fly?
          </span>
        </h1>
        <p className="text-lg text-white/90 max-w-2xl mx-auto drop-shadow">
          Search hundreds of airlines and compare prices instantly to find your perfect flight
        </p>
      </div>

      <div className="mb-10 relative z-20">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {!searchParams && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6">
            <Plane className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready for your next adventure?</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter your travel details above to discover the best flight deals from hundreds of airlines.
          </p>
        </div>
      )}

      {searchParams && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              <p className="text-sm text-gray-500">Filter options coming soon</p>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Price Trends</h3>
              <div className="h-48 flex items-center justify-center text-gray-400">
                Price graph coming soon
              </div>
            </div>
            <FlightList flights={flights} isLoading={isLoading} error={error} />
          </div>
        </div>
      )}
    </div>
  );
}
