import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/lib/amadeus";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword");

  if (!keyword || keyword.length < 2) {
    return NextResponse.json({ airports: [] });
  }

  try {
    const response = await searchAirports(keyword);

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
