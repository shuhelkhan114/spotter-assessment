"use client";

import { useRef, useEffect, useState } from "react";
import { Users, ChevronDown } from "lucide-react";
import { Passengers } from "@/lib/types";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

interface PassengerSelectorProps {
  passengers: Passengers;
  onUpdate: (type: keyof Passengers, delta: number) => void;
  showDropdown: boolean;
  onToggle: () => void;
  onClose: () => void;
  label?: string;
  compact?: boolean;
}

export function PassengerSelector({
  passengers,
  onUpdate,
  showDropdown,
  onToggle,
  onClose,
  label,
  compact = false,
}: PassengerSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const total = passengers.adults + passengers.children + passengers.infants;
  const displayText = total === 1 ? "1 Traveler" : `${total} Travelers`;

  if (compact) {
    return (
      <div className="relative flex-1 sm:flex-none" ref={ref}>
        <button
          type="button"
          onClick={onToggle}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-400 transition-all text-sm whitespace-nowrap cursor-pointer"
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-gray-900">{displayText}</span>
        </button>
        {showDropdown && (
          <PassengerDropdown
            passengers={passengers}
            onUpdate={onUpdate}
            total={total}
            compact
            isMobileView
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
          Travelers
        </label>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="w-full lg:w-36 flex items-center gap-2 px-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all text-left cursor-pointer"
      >
        <Users className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="text-sm text-gray-900 flex-1 truncate">{displayText}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      {showDropdown && (
        <PassengerDropdown
          passengers={passengers}
          onUpdate={onUpdate}
          total={total}
        />
      )}
    </div>
  );
}

interface PassengerDropdownProps {
  passengers: Passengers;
  onUpdate: (type: keyof Passengers, delta: number) => void;
  total: number;
  compact?: boolean;
  isMobileView?: boolean;
}

function PassengerDropdown({
  passengers,
  onUpdate,
  total,
  compact = false,
  isMobileView = false,
}: PassengerDropdownProps) {
  const isMobile = useIsMobile();
  const buttonSize = compact ? "w-7 h-7" : "w-8 h-8";
  const gap = compact ? "gap-2" : "gap-3";
  const spacing = compact ? "space-y-3" : "space-y-4";
  const counterWidth = compact ? "w-5" : "w-6";

  // Use fixed positioning on mobile compact mode
  const useFixedPosition = isMobileView && isMobile;

  const content = (
    <div className={spacing}>
      <PassengerRow
        label="Adults"
        sublabel="Age 12+"
        value={passengers.adults}
        onDecrement={() => onUpdate("adults", -1)}
        onIncrement={() => onUpdate("adults", 1)}
        decrementDisabled={passengers.adults <= 1 || passengers.adults <= passengers.infants}
        incrementDisabled={total >= 9}
        buttonSize={buttonSize}
        gap={gap}
        counterWidth={counterWidth}
      />

      <PassengerRow
        label="Children"
        sublabel="Age 2-11"
        value={passengers.children}
        onDecrement={() => onUpdate("children", -1)}
        onIncrement={() => onUpdate("children", 1)}
        decrementDisabled={passengers.children <= 0}
        incrementDisabled={total >= 9}
        buttonSize={buttonSize}
        gap={gap}
        counterWidth={counterWidth}
      />

      <PassengerRow
        label="Infants"
        sublabel={compact ? "Under 2" : "Under 2 (on lap)"}
        value={passengers.infants}
        onDecrement={() => onUpdate("infants", -1)}
        onIncrement={() => onUpdate("infants", 1)}
        decrementDisabled={passengers.infants <= 0}
        incrementDisabled={passengers.infants >= passengers.adults || total >= 9}
        buttonSize={buttonSize}
        gap={gap}
        counterWidth={counterWidth}
      />

      {passengers.infants > 0 && !compact && (
        <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
          Each infant must be accompanied by an adult
        </p>
      )}
    </div>
  );

  if (useFixedPosition) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/20 z-40" />
        {/* Mobile popover - positioned from top with margin */}
        <div className="fixed left-1/2 top-4 -translate-x-1/2 z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          {content}
        </div>
      </>
    );
  }

  return (
    <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 right-0">
      {content}
    </div>
  );
}

interface PassengerRowProps {
  label: string;
  sublabel: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled: boolean;
  incrementDisabled: boolean;
  buttonSize: string;
  gap: string;
  counterWidth: string;
}

function PassengerRow({
  label,
  sublabel,
  value,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
  buttonSize,
  gap,
  counterWidth,
}: PassengerRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{sublabel}</div>
      </div>
      <div className={`flex items-center ${gap}`}>
        <button
          type="button"
          onClick={onDecrement}
          className={`${buttonSize} rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0`}
          disabled={decrementDisabled}
        >
          -
        </button>
        <span className={`text-sm font-medium ${counterWidth} text-center`}>
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className={`${buttonSize} rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0`}
          disabled={incrementDisabled}
        >
          +
        </button>
      </div>
    </div>
  );
}
