"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { searchAirports, Airport } from "@/lib/api/airports";

export type { Airport } from "@/lib/api/airports";

interface UseAirportSearchReturn {
  airports: Airport[];
  isLoading: boolean;
  error: string | null;
  search: (keyword: string) => void;
  clear: () => void;
}

export function useAirportSearch(): UseAirportSearchReturn {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((keyword: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if keyword is too short
    if (keyword.length < 2) {
      setAirports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Debounce the API call
    debounceTimerRef.current = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await searchAirports(keyword);
        setAirports(response.airports || []);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === "CanceledError") {
          return;
        }
        setError(err instanceof Error ? err.message : "An error occurred");
        setAirports([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setAirports([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { airports, isLoading, error, search, clear };
}
