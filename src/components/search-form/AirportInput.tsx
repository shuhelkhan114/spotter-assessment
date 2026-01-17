"use client";

import { useState } from "react";
import { MapPin, Loader2, Plane, Building2 } from "lucide-react";
import { useAirportSearch, Airport } from "@/hooks/useAirportSearch";

interface AirportInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (airport: Airport) => void;
  placeholder: string;
  label?: string;
  variant?: "origin" | "destination";
  compact?: boolean;
}

export function AirportInput({
  value,
  onChange,
  onSelect,
  placeholder,
  label,
  variant = "origin",
  compact = false,
}: AirportInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { airports, isLoading, search, clear } = useAirportSearch();

  const handleChange = (newValue: string) => {
    onChange(newValue);
    search(newValue);
  };

  const handleSelect = (airport: Airport) => {
    onSelect(airport);
    setShowDropdown(false);
    clear();
  };

  const iconColor = variant === "origin" ? "text-blue-500" : "text-indigo-500";
  const hoverBg = variant === "origin" ? "hover:bg-blue-50" : "hover:bg-indigo-50";
  const codeColor = variant === "origin" ? "text-blue-600" : "text-indigo-600";
  const iconBg = variant === "origin" ? "bg-blue-50" : "bg-indigo-50";

  if (compact) {
    return (
      <div className="relative flex-1">
        <div className="relative">
          <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            required
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        {showDropdown && airports.length > 0 && (
          <AirportDropdown
            airports={airports}
            onSelect={handleSelect}
            hoverBg={hoverBg}
            iconBg={iconBg}
            iconColor={iconColor}
            codeColor={codeColor}
            compact
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative flex-1">
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
          required
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
      {showDropdown && airports.length > 0 && (
        <AirportDropdown
          airports={airports}
          onSelect={handleSelect}
          hoverBg={hoverBg}
          iconBg={iconBg}
          iconColor={iconColor}
          codeColor={codeColor}
        />
      )}
    </div>
  );
}

interface AirportDropdownProps {
  airports: Airport[];
  onSelect: (airport: Airport) => void;
  hoverBg: string;
  iconBg: string;
  iconColor: string;
  codeColor: string;
  compact?: boolean;
}

function AirportDropdown({
  airports,
  onSelect,
  hoverBg,
  iconBg,
  iconColor,
  codeColor,
  compact = false,
}: AirportDropdownProps) {
  const minWidth = compact ? "min-w-[340px]" : "min-w-[360px]";
  const padding = compact ? "px-3 py-2.5" : "px-4 py-3";
  const iconSize = compact ? "w-8 h-8" : "w-9 h-9";
  const textSize = compact ? "text-sm" : "";

  return (
    <div className={`absolute z-50 ${minWidth} mt-1 bg-white border border-gray-200 rounded-xl shadow-xl`}>
      {airports.slice(0, 10).map((airport) => (
        <button
          key={airport.id}
          type="button"
          onClick={() => onSelect(airport)}
          className={`w-full ${padding} text-left ${hoverBg} cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors`}
        >
          <div
            className={`${iconSize} rounded-lg flex items-center justify-center shrink-0 ${
              airport.type === "AIRPORT" ? iconBg : "bg-purple-50"
            }`}
          >
            {airport.type === "AIRPORT" ? (
              <Plane className={`w-4 h-4 ${iconColor}`} />
            ) : (
              <Building2 className="w-4 h-4 text-purple-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-gray-900 truncate ${textSize}`}>
              {airport.name}
            </div>
            <div className="text-xs text-gray-500">{airport.city}</div>
          </div>
          <div className={`font-bold ${codeColor} shrink-0 ${textSize}`}>
            {airport.code}
          </div>
        </button>
      ))}
    </div>
  );
}
