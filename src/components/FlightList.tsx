"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Flight } from "@/lib/types";
import FlightCard from "./FlightCard";
import { Plane, AlertCircle, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 20;

type SortOption = "price" | "duration" | "departure" | "stops";

interface FlightListProps {
  flights: Flight[];
  isLoading: boolean;
  error: string | null;
  totalCount?: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "price", label: "Price (lowest)" },
  { value: "duration", label: "Duration (shortest)" },
  { value: "departure", label: "Departure (earliest)" },
  { value: "stops", label: "Stops (fewest)" },
];

function parseDuration(duration: string): number {
  // Parse ISO 8601 duration format like "PT2H30M" or simple "2h 30m"
  const isoMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (isoMatch) {
    const hours = parseInt(isoMatch[1] || "0");
    const minutes = parseInt(isoMatch[2] || "0");
    return hours * 60 + minutes;
  }

  const simpleMatch = duration.match(/(\d+)h\s*(?:(\d+)m)?/i);
  if (simpleMatch) {
    const hours = parseInt(simpleMatch[1] || "0");
    const minutes = parseInt(simpleMatch[2] || "0");
    return hours * 60 + minutes;
  }

  return 0;
}

function FlightSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 lg:w-32">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-14 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="h-6 w-12 bg-gray-200 rounded mb-1 mx-auto" />
              <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="flex-1 flex flex-col items-center px-4">
              <div className="h-3 w-12 bg-gray-200 rounded mb-2" />
              <div className="w-full h-px bg-gray-200" />
              <div className="h-3 w-16 bg-gray-200 rounded mt-2" />
            </div>
            <div className="text-center">
              <div className="h-6 w-12 bg-gray-200 rounded mb-1 mx-auto" />
              <div className="h-4 w-8 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 lg:pl-6">
          <div>
            <div className="h-7 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-14 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-16 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function FlightList({ flights, isLoading, error, totalCount }: FlightListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Get page and sort from URL params
  const currentPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const sortBy = (searchParams.get("sort") as SortOption) || "price";

  // Validate sortBy is a valid option
  const validSortBy = sortOptions.some((o) => o.value === sortBy) ? sortBy : "price";

  const updateUrlParams = useCallback(
    (updates: { page?: number; sort?: SortOption }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete("page");
        } else {
          params.set("page", updates.page.toString());
        }
      }

      if (updates.sort !== undefined) {
        if (updates.sort === "price") {
          params.delete("sort");
        } else {
          params.set("sort", updates.sort);
        }
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
    scrollToTop();
  };

  const handleSortChange = (sort: SortOption) => {
    updateUrlParams({ sort, page: 1 });
    setShowSortDropdown(false);
  };

  const sortedFlights = useMemo(() => {
    return [...flights].sort((a, b) => {
      switch (validSortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          return parseDuration(a.duration) - parseDuration(b.duration);
        case "departure":
          return new Date(a.departure.time).getTime() - new Date(b.departure.time).getTime();
        case "stops":
          return a.stops - b.stops;
        default:
          return 0;
      }
    });
  }, [flights, validSortBy]);

  // Reset page to 1 when flights change (new search)
  const [prevFlightsLength, setPrevFlightsLength] = useState(flights.length);

  // Detect when flights change and reset page
  if (flights.length !== prevFlightsLength && flights.length > 0) {
    setPrevFlightsLength(flights.length);
    // Only reset if not already on page 1
    if (currentPage !== 1) {
      updateUrlParams({ page: 1 });
    }
  }

  const totalPages = Math.ceil(sortedFlights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFlights = sortedFlights.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const cheapestPrice = useMemo(() => {
    if (flights.length === 0) return 0;
    return Math.min(...flights.map((f) => f.price));
  }, [flights]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-800 mb-1">Search Failed</h3>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <FlightSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights found</h3>
        <p className="text-sm text-gray-500">
          Try adjusting your search criteria or selecting different dates.
        </p>
      </div>
    );
  }

  const isFiltered = totalCount !== undefined && totalCount > flights.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">
            {flights.length} flight{flights.length !== 1 ? "s" : ""}
            {isFiltered && (
              <span className="text-gray-500 font-normal"> of {totalCount}</span>
            )}
          </h3>
          <span className="text-sm text-gray-500">
            Prices from <span className="font-semibold text-gray-900">${cheapestPrice.toLocaleString()}</span>
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            onBlur={() => setTimeout(() => setShowSortDropdown(false), 200)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span>{sortOptions.find((o) => o.value === validSortBy)?.label}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
          </button>

          {showSortDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                    validSortBy === option.value
                      ? "text-blue-600 font-medium bg-blue-50"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {paginatedFlights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedFlights.length)} of {sortedFlights.length} flights
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
