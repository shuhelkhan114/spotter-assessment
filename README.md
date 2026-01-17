# Flight Search

A flight search application built with Next.js 16 and React 19 that integrates with the Amadeus API.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Environment Variables

Create a `.env.local` file with your Amadeus API credentials:

```
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret
```

## Architecture

### API Layer

The application uses a two-tier API pattern. Internal route handlers (`/api/flights`, `/api/airports`) validate requests with Zod, then forward them to the Amadeus API. This keeps credentials server-side and allows response transformation before reaching the client.

The Amadeus client handles OAuth 2.0 authentication with automatic token refresh. Tokens are cached and refreshed 60 seconds before expiry.

### State Management

- **React Query** manages server state with a 60-second stale time
- **URL query parameters** persist all application state (search params, filters, pagination, sort order)
- **Local component state** handles UI interactions like the price slider before committing changes

URL-based state enables shareable links and browser navigation support.

### Data Flow

```
SearchForm -> URL params -> useFlightSearch hook -> /api/flights -> Amadeus API
                                                          |
                                                   Transform response
                                                          |
                                           FilterPanel (client-side filtering)
                                                          |
                                           FlightList (sort + paginate)
```

### Component Structure

```
src/
├── app/
│   ├── api/
│   │   ├── airports/route.ts
│   │   └── flights/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── FilterPanel.tsx
│   ├── FlightCard.tsx
│   ├── FlightList.tsx
│   ├── PriceGraph.tsx
│   ├── SearchForm.tsx
│   ├── filters/
│   └── search-form/
├── hooks/
│   ├── useFlightSearch.ts
│   └── useAirportSearch.ts
└── lib/
    ├── api/
    │   ├── amadeus-client.ts
    │   ├── amadeus-service.ts
    │   └── ...
    ├── types.ts
    ├── utils/
    └── validations/
```

### Filtering and Sorting

Filtering happens client-side with `useMemo`. Available filter options (airlines, stop counts) are computed from the actual flight results. Sorting supports price, duration, departure time, and number of stops. Pagination displays 20 results per page.

### Validation

Three layers of validation:
1. Client-side form validation with React Hook Form
2. Server-side request validation with Zod schemas
3. Business logic validation (date ordering, passenger limits)

Passenger rules enforce a maximum of 9 total passengers, with infants limited to the number of adults.

## Technical Decisions

**Why internal API routes?**
Keeps Amadeus credentials on the server. Also allows request/response transformation and consistent error handling.

**Why URL-based state?**
Users can share search results, use browser back/forward, and bookmark specific searches. The URL is the single source of truth for the application state.

**Why client-side filtering?**
The Amadeus API returns all matching flights. Client-side filtering provides instant feedback when adjusting stops, price range, or airline filters without additional API calls.

**Why React Query?**
Handles caching, background refetching, and loading/error states. The flight search uses a mutation since each search is a distinct operation, not a cached resource.

**Why Tailwind?**
Rapid styling with utility classes. The responsive design uses a mobile-first approach with breakpoints for larger screens.

## Dependencies

| Package | Purpose |
|---------|---------|
| @tanstack/react-query | Server state management |
| axios | HTTP client |
| react-hook-form | Form state |
| zod | Schema validation |
| react-day-picker | Date selection |
| recharts | Price trend graph |
| lucide-react | Icons |
| date-fns | Date formatting |
