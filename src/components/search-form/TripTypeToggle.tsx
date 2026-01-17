"use client";

interface TripTypeToggleProps {
  value: "roundtrip" | "oneway";
  onChange: (value: "roundtrip" | "oneway") => void;
}

export function TripTypeToggle({ value, onChange }: TripTypeToggleProps) {
  return (
    <div className="flex gap-1 mb-6 bg-gray-100/80 rounded-xl p-1 w-fit">
      <button
        type="button"
        onClick={() => onChange("roundtrip")}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
          value === "roundtrip"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Round trip
      </button>
      <button
        type="button"
        onClick={() => onChange("oneway")}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
          value === "oneway"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-900"
        }`}
      >
        One way
      </button>
    </div>
  );
}
