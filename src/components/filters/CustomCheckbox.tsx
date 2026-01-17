"use client";

import { Check } from "lucide-react";

interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  count: number;
  icon?: React.ReactNode;
}

export function CustomCheckbox({
  checked,
  onChange,
  label,
  count,
  icon,
}: CustomCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        checked
          ? "border-blue-500 bg-blue-50/50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-5 h-5 flex-shrink-0 rounded-md flex items-center justify-center transition-all duration-200 ${
            checked
              ? "bg-blue-500 text-white"
              : "bg-gray-100 border border-gray-200"
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span
            className={`text-sm font-medium truncate ${
              checked ? "text-gray-900" : "text-gray-600"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          checked ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
