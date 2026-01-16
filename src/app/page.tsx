"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchForm from "@/components/SearchForm";
import FlightList from "@/components/FlightList";
import PriceGraph from "@/components/PriceGraph";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { Plane, Sparkles } from "lucide-react";
import { SearchParams } from "@/lib/types";

function HomeContent() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const { flights, isLoading, error, search } = useFlightSearch();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);

  const parseUrlParams = useCallback((): SearchParams | null => {
    const origin = urlSearchParams.get("origin");
    const destination = urlSearchParams.get("destination");
    const departureDate = urlSearchParams.get("departureDate");
    const returnDate = urlSearchParams.get("returnDate") || "";
    const adults = urlSearchParams.get("adults");
    const children = urlSearchParams.get("children");
    const infants = urlSearchParams.get("infants");
    const tripType = urlSearchParams.get("tripType") as "roundtrip" | "oneway";

    if (origin && destination && departureDate && adults) {
      return {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers: {
          adults: parseInt(adults) || 1,
          children: parseInt(children || "0"),
          infants: parseInt(infants || "0"),
        },
        tripType: tripType || (returnDate ? "roundtrip" : "oneway"),
      };
    }
    return null;
  }, [urlSearchParams]);

  useEffect(() => {
    if (initialLoadRef.current) {
      const params = parseUrlParams();
      if (params) {
        setSearchParams(params);
        search(params);
      }
      initialLoadRef.current = false;
    }
  }, [parseUrlParams, search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const updateUrlParams = (params: SearchParams) => {
    const url = new URLSearchParams();
    url.set("origin", params.origin);
    url.set("destination", params.destination);
    url.set("departureDate", params.departureDate);
    if (params.returnDate) url.set("returnDate", params.returnDate);
    url.set("adults", params.passengers.adults.toString());
    if (params.passengers.children > 0) url.set("children", params.passengers.children.toString());
    if (params.passengers.infants > 0) url.set("infants", params.passengers.infants.toString());
    url.set("tripType", params.tripType);
    router.push(`?${url.toString()}`, { scroll: false });
  };

  const handleSearch = async (params: SearchParams) => {
    setSearchParams(params);
    updateUrlParams(params);
    await search(params);
  };

  return (
    <>
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

        <div ref={sentinelRef} className="h-0" />
        <div
          className={`mb-10 z-30 transition-all duration-300 ease-out ${
            isSticky
              ? "fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 py-3 px-4 sm:px-6 lg:px-8"
              : "relative"
          }`}
        >
          <div className={isSticky ? "max-w-7xl mx-auto" : ""}>
            <SearchForm onSearch={handleSearch} isLoading={isLoading} compact={isSticky} initialValues={searchParams} />
          </div>
        </div>
        {isSticky && <div className="h-24" />}

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
              <PriceGraph flights={flights} isLoading={isLoading} />
            </div>
            <FlightList flights={flights} isLoading={isLoading} error={error} />
          </div>
        </div>
      )}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}
