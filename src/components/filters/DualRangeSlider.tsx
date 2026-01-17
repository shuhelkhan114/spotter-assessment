"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface DualRangeSliderProps {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
  onChangeEnd: () => void;
}

export function DualRangeSlider({
  min,
  max,
  values,
  onChange,
  onChangeEnd,
}: DualRangeSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const getPercent = useCallback(
    (value: number) => ((value - min) / (max - min)) * 100,
    [min, max]
  );

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return min;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      return Math.round(min + percent * (max - min));
    },
    [min, max]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: "min" | "max") => {
      e.preventDefault();
      setDragging(handle);
    },
    []
  );

  const handleTouchStart = useCallback(
    (_e: React.TouchEvent, handle: "min" | "max") => {
      setDragging(handle);
    },
    []
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (clientX: number) => {
      const newValue = getValueFromPosition(clientX);
      if (dragging === "min") {
        onChange([Math.min(newValue, values[1] - 10), values[1]]);
      } else {
        onChange([values[0], Math.max(newValue, values[0] + 10)]);
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    const handleEnd = () => {
      setDragging(null);
      onChangeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [dragging, values, getValueFromPosition, onChange, onChangeEnd]);

  const minPercent = getPercent(values[0]);
  const maxPercent = getPercent(values[1]);

  return (
    <div className="pt-2 pb-4">
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />

        {/* Min handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-150 ${
            dragging === "min"
              ? "border-blue-600 scale-110 shadow-blue-200"
              : "border-blue-500 hover:scale-105"
          }`}
          style={{ left: `${minPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, "min")}
          onTouchStart={(e) => handleTouchStart(e, "min")}
        >
          <div className="absolute inset-1 bg-blue-500 rounded-full" />
        </div>

        {/* Max handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 cursor-grab active:cursor-grabbing transition-all duration-150 ${
            dragging === "max"
              ? "border-blue-600 scale-110 shadow-blue-200"
              : "border-blue-500 hover:scale-105"
          }`}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={(e) => handleMouseDown(e, "max")}
          onTouchStart={(e) => handleTouchStart(e, "max")}
        >
          <div className="absolute inset-1 bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
