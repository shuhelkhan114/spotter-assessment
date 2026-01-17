import { z } from "zod";

// Airport search schema
export const airportSearchSchema = z.object({
  keyword: z.string().min(2, "Keyword must be at least 2 characters"),
});

// Flight search schema
export const flightSearchSchema = z.object({
  origin: z
    .string()
    .min(3, "Origin must be a valid airport code")
    .max(3, "Origin must be a valid airport code")
    .toUpperCase(),
  destination: z
    .string()
    .min(3, "Destination must be a valid airport code")
    .max(3, "Destination must be a valid airport code")
    .toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .nullish(),
  adults: z.coerce.number().int().min(1).max(9),
  children: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val) : 0)),
  infants: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val) : 0)),
  nonStop: z
    .string()
    .nullish()
    .transform((val) => val === "true"),
  maxPrice: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val) : undefined)),
  includedAirlineCodes: z
    .string()
    .nullish()
    .transform((val) => (val ? val.split(",").filter(Boolean) : undefined)),
});

// Types derived from schemas
export type AirportSearchInput = z.infer<typeof airportSearchSchema>;
export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
