"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SearchForm from "@/components/SearchForm";
import FlightList from "@/components/FlightList";
import PriceGraph from "@/components/PriceGraph";
import FilterPanel, { FilterState } from "@/components/FilterPanel";
import { useFlightSearch } from "@/hooks/useFlightSearch";
import { Plane, Sparkles } from "lucide-react";
import { SearchParams } from "@/lib/types";

function HomeContent() {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const { flights, isLoading, error, search, carriers } = useFlightSearch();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);
  const [filters, setFilters] = useState<FilterState>({
    stops: [],
    priceRange: [0, 0],
    airlines: [],
  });

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      // Filter by stops
      if (filters.stops.length > 0 && !filters.stops.includes(flight.stops)) {
        return false;
      }

      // Filter by price range
      if (filters.priceRange[0] > 0 || filters.priceRange[1] > 0) {
        if (flight.price < filters.priceRange[0] || flight.price > filters.priceRange[1]) {
          return false;
        }
      }

      // Filter by airlines
      if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airlineCode)) {
        return false;
      }

      return true;
    });
  }, [flights, filters]);

  const parseUrlParams = useCallback((): SearchParams | null => {
    const origin = urlSearchParams.get("origin");
    const destination = urlSearchParams.get("destination");
    const departureDate = urlSearchParams.get("departureDate");
    const returnDate = urlSearchParams.get("returnDate") || "";
    const adults = urlSearchParams.get("adults");
    const children = urlSearchParams.get("children");
    const infants = urlSearchParams.get("infants");
    const tripType = urlSearchParams.get("tripType") as "roundtrip" | "oneway";

    // API-level filter params from URL
    const stopsParam = urlSearchParams.get("stops");
    const maxPrice = urlSearchParams.get("maxPrice");
    const airlinesParam = urlSearchParams.get("airlines");

    if (origin && destination && departureDate && adults) {
      const params: SearchParams = {
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

      // Add API-level filters if present in URL
      // nonStop: only if stops filter is exactly [0] (nonstop only)
      if (stopsParam === "0") {
        params.nonStop = true;
      }

      // maxPrice: pass to API for server-side filtering
      if (maxPrice) {
        params.maxPrice = parseInt(maxPrice);
      }

      // includedAirlineCodes: pass to API for server-side filtering
      if (airlinesParam) {
        params.includedAirlineCodes = airlinesParam.split(",").filter(Boolean);
      }

      return params;
    }
    return null;
  }, [urlSearchParams]);

  const parseFilterParams = useCallback((): FilterState | null => {
    const stopsParam = urlSearchParams.get("stops");
    const minPrice = urlSearchParams.get("minPrice");
    const maxPrice = urlSearchParams.get("maxPrice");
    const airlinesParam = urlSearchParams.get("airlines");

    const hasFilterParams = stopsParam || minPrice || maxPrice || airlinesParam;

    if (hasFilterParams) {
      return {
        stops: stopsParam ? stopsParam.split(",").map(Number).filter(n => !isNaN(n)) : [],
        priceRange: [
          minPrice ? parseInt(minPrice) : 0,
          maxPrice ? parseInt(maxPrice) : 0,
        ],
        airlines: airlinesParam ? airlinesParam.split(",").filter(Boolean) : [],
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
      const filterParams = parseFilterParams();
      if (filterParams) {
        setFilters(filterParams);
      }
      initialLoadRef.current = false;
    }
  }, [parseUrlParams, parseFilterParams, search]);

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

  const updateUrlParams = (params: SearchParams, filterState?: FilterState) => {
    const url = new URLSearchParams();
    url.set("origin", params.origin);
    url.set("destination", params.destination);
    url.set("departureDate", params.departureDate);
    if (params.returnDate) url.set("returnDate", params.returnDate);
    url.set("adults", params.passengers.adults.toString());
    if (params.passengers.children > 0) url.set("children", params.passengers.children.toString());
    if (params.passengers.infants > 0) url.set("infants", params.passengers.infants.toString());
    url.set("tripType", params.tripType);

    // Add filter params if provided
    if (filterState) {
      if (filterState.stops.length > 0) {
        url.set("stops", filterState.stops.join(","));
      }
      if (filterState.priceRange[0] > 0) {
        url.set("minPrice", filterState.priceRange[0].toString());
      }
      if (filterState.priceRange[1] > 0) {
        url.set("maxPrice", filterState.priceRange[1].toString());
      }
      if (filterState.airlines.length > 0) {
        url.set("airlines", filterState.airlines.join(","));
      }
    }

    router.push(`?${url.toString()}`, { scroll: false });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (searchParams) {
      updateUrlParams(searchParams, newFilters);
    }
  };

  const handleSearch = async (params: SearchParams) => {
    setSearchParams(params);
    updateUrlParams(params);
    // Reset filters when performing a new search
    setFilters({
      stops: [],
      priceRange: [0, 0],
      airlines: [],
    });
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
            <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 shadow-sm">
              <FilterPanel
                flights={flights}
                filters={filters}
                onFilterChange={handleFilterChange}
                carriers={carriers}
                isLoading={isLoading}
              />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Price Trends</h3>
              <PriceGraph flights={filteredFlights} isLoading={isLoading} />
            </div>
            <FlightList flights={filteredFlights} isLoading={isLoading} error={error} totalCount={flights.length} />
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
