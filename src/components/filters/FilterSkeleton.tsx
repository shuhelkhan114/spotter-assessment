"use client";

export function FilterSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-16" />
      </div>

      {/* Stops skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-12" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Price range skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-px bg-gray-200" />
            </div>
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-8 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Airlines skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
