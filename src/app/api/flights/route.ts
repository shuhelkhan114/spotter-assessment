import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/api/amadeus-service";
import { flightSearchSchema } from "@/lib/validations/schemas";
import { transformFlightOffer } from "@/lib/utils/flight-transformer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse query params into object
  const rawParams = {
    origin: searchParams.get("origin") || "",
    destination: searchParams.get("destination") || "",
    departureDate: searchParams.get("departureDate") || "",
    returnDate: searchParams.get("returnDate"),
    adults: searchParams.get("adults") || "1",
    children: searchParams.get("children"),
    infants: searchParams.get("infants"),
    nonStop: searchParams.get("nonStop"),
    maxPrice: searchParams.get("maxPrice"),
    includedAirlineCodes: searchParams.get("includedAirlineCodes"),
  };

  // Validate with Zod
  const result = flightSearchSchema.safeParse(rawParams);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const firstError = Object.values(errors)[0]?.[0] || "Invalid parameters";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const params = result.data;

  // Additional business logic validations
  if (params.origin === params.destination) {
    return NextResponse.json(
      { error: "Origin and destination cannot be the same" },
      { status: 400 }
    );
  }

  const departureDateObj = new Date(params.departureDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (departureDateObj < today) {
    return NextResponse.json(
      { error: "Departure date cannot be in the past" },
      { status: 400 }
    );
  }

  if (params.returnDate) {
    const returnDateObj = new Date(params.returnDate);
    if (returnDateObj < departureDateObj) {
      return NextResponse.json(
        { error: "Return date cannot be before departure date" },
        { status: 400 }
      );
    }
  }

  const totalPassengers =
    params.adults + (params.children || 0) + (params.infants || 0);

  if (totalPassengers > 9) {
    return NextResponse.json(
      { error: "Total passengers cannot exceed 9" },
      { status: 400 }
    );
  }

  if ((params.infants || 0) > params.adults) {
    return NextResponse.json(
      { error: "Each infant must be accompanied by an adult" },
      { status: 400 }
    );
  }

  try {
    const response = await searchFlights(params);

    const carriers = response.dictionaries?.carriers || {};
    const aircraft = response.dictionaries?.aircraft || {};

    const flights = response.data.map((offer) =>
      transformFlightOffer(offer, carriers, aircraft)
    );

    return NextResponse.json({ flights, carriers });
  } catch (error) {
    console.error("Flight search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to search flights",
      },
      { status: 500 }
    );
  }
}
