import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/lib/api/amadeus-service";
import { airportSearchSchema } from "@/lib/validations/schemas";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword") || "";

  // Validate with Zod
  const result = airportSearchSchema.safeParse({ keyword });

  if (!result.success) {
    return NextResponse.json({ airports: [] });
  }

  try {
    const response = await searchAirports(result.data.keyword);

    const airports = response.data.map((location) => ({
      id: location.id,
      code: location.iataCode,
      name: location.name,
      city: location.address.cityName,
      country: location.address.countryName,
      type: location.subType,
    }));

    return NextResponse.json({ airports });
  } catch (error) {
    console.error("Airport search error:", error);
    return NextResponse.json(
      { error: "Failed to search airports" },
      { status: 500 }
    );
  }
}
