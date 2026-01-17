"use client";

import { useRef, useEffect, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

interface DatePickerInputProps {
  tripType: "roundtrip" | "oneway";
  dateRange: DateRange | undefined;
  singleDate: Date | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onSingleDateChange: (date: Date | undefined) => void;
  showPicker: boolean;
  onTogglePicker: () => void;
  onClose: () => void;
  label?: string;
  compact?: boolean;
}

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

export function DatePickerInput({
  tripType,
  dateRange,
  singleDate,
  onDateRangeChange,
  onSingleDateChange,
  showPicker,
  onTogglePicker,
  onClose,
  label,
  compact = false,
}: DatePickerInputProps) {
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

  const getDisplayText = () => {
    if (tripType === "roundtrip") {
      if (dateRange?.from && dateRange?.to) {
        return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`;
      }
      if (dateRange?.from) {
        return `${format(dateRange.from, "MMM d, yyyy")} - Select return`;
      }
    } else {
      if (singleDate) {
        return format(singleDate, "MMM d, yyyy");
      }
    }
    return "Select dates";
  };

  const hasValue = dateRange?.from || singleDate;

  if (compact) {
    return (
      <div className="relative flex-1 sm:flex-none" ref={ref}>
        <button
          type="button"
          onClick={onTogglePicker}
          className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-400 transition-all text-sm whitespace-nowrap cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className={hasValue ? "text-gray-900" : "text-gray-500"}>
            {getDisplayText()}
          </span>
        </button>
        {showPicker && (
          <DatePickerPopover
            tripType={tripType}
            dateRange={dateRange}
            singleDate={singleDate}
            onDateRangeChange={onDateRangeChange}
            onSingleDateChange={onSingleDateChange}
            compact
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
          {tripType === "roundtrip" ? "Dates" : "Departure"}
        </label>
      )}
      <button
        type="button"
        onClick={onTogglePicker}
        className="w-full lg:w-64 flex items-center gap-2 px-4 py-3 bg-gray-50/50 border border-gray-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all text-left cursor-pointer"
      >
        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
        <span
          className={`text-sm flex-1 truncate whitespace-nowrap ${
            hasValue ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {getDisplayText()}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>
      {showPicker && (
        <DatePickerPopover
          tripType={tripType}
          dateRange={dateRange}
          singleDate={singleDate}
          onDateRangeChange={onDateRangeChange}
          onSingleDateChange={onSingleDateChange}
          position="right-0 lg:right-auto"
        />
      )}
    </div>
  );
}

interface DatePickerPopoverProps {
  tripType: "roundtrip" | "oneway";
  dateRange: DateRange | undefined;
  singleDate: Date | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onSingleDateChange: (date: Date | undefined) => void;
  position?: string;
  compact?: boolean;
}

function DatePickerPopover({
  tripType,
  dateRange,
  singleDate,
  onDateRangeChange,
  onSingleDateChange,
  position = "right-0",
  compact = false,
}: DatePickerPopoverProps) {
  const isMobile = useIsMobile();
  // On mobile compact mode, use fixed positioning to center the picker
  // On desktop or non-compact, use absolute positioning
  const useFixedPosition = compact && isMobile;

  if (useFixedPosition) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/20 z-40" />
        {/* Mobile popover - positioned from top with margin */}
        <div className="fixed left-1/2 top-4 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 max-w-[95vw] max-h-[calc(100vh-2rem)] overflow-auto">
          {tripType === "roundtrip" ? (
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
              className="font-sans!"
            />
          ) : (
            <DayPicker
              mode="single"
              selected={singleDate}
              onSelect={onSingleDateChange}
              disabled={{ before: new Date() }}
              className="font-sans!"
            />
          )}
        </div>
      </>
    );
  }

  return (
    <div className={`absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 ${position}`}>
      {tripType === "roundtrip" ? (
        <DayPicker
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={isMobile ? 1 : 2}
          disabled={{ before: new Date() }}
          className="font-sans!"
        />
      ) : (
        <DayPicker
          mode="single"
          selected={singleDate}
          onSelect={onSingleDateChange}
          disabled={{ before: new Date() }}
          className="font-sans!"
        />
      )}
    </div>
  );
}
