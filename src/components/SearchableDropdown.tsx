import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { STATES, UNION_TERRITORIES } from "../constants";

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // custom styling for the trigger button
  buttonBg?: string; // background color class for the trigger button
}

export default function SearchableDropdown({
  value,
  onChange,
  placeholder = "Select State Location",
  className = "",
  buttonBg = "bg-slate-50"
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Combine options (States alphabetically, then Union Territories alphabetically)
  // Sorted is already done in constants.ts, but we verify flat structures.
  const statesList = STATES;
  const utList = UNION_TERRITORIES;

  // Filter items based on search term
  const filteredStates = statesList.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredUTs = utList.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if "All India / Central" matches search
  const isAllIndiaMatch = "all india / central".includes(searchTerm.toLowerCase()) || 
                          "central".includes(searchTerm.toLowerCase());

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Find label of currently selected item
  const selectedLabel = value === "" ? "All India / Central" : value;

  return (
    <div className="relative w-full" ref={dropdownRef} id="searchable-state-dropdown-container">
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border border-slate-200 ${buttonBg} px-3 py-2 text-xs text-slate-800 transition-colors hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${className}`}
        id="searchable-state-dropdown-trigger"
      >
        <span className="truncate">{selectedLabel}</span>
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          {value !== "" && (
            <span
              onClick={handleClear}
              className="rounded-full p-0.5 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              title="Clear selection"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100"
          id="searchable-state-dropdown-menu"
        >
          {/* Search Box */}
          <div className="flex items-center border-b border-slate-100 px-2.5 py-1.5 bg-slate-50">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1.5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1 text-xs" id="searchable-state-options-list">
            {/* 1. All India / Central option */}
            {isAllIndiaMatch && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors font-medium ${
                  value === "" ? "bg-blue-50 text-blue-600" : "text-slate-700"
                }`}
              >
                <span>All India / Central</span>
                {value === "" && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </button>
            )}

            {/* 2. States (Alphabetical, flat, no 'States' heading) */}
            {filteredStates.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => handleSelect(state)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                  value === state ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-700"
                }`}
              >
                <span>{state}</span>
                {value === state && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </button>
            ))}

            {/* 3. Union Territories Section Header */}
            {filteredUTs.length > 0 && (
              <div className="sticky top-0 bg-slate-100/90 backdrop-blur-xs px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-y border-slate-150">
                Union Territories
              </div>
            )}

            {/* 4. Union Territories Options */}
            {filteredUTs.map((ut) => (
              <button
                key={ut}
                type="button"
                onClick={() => handleSelect(ut)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors ${
                  value === ut ? "bg-blue-50 text-blue-600 font-semibold" : "text-slate-700"
                }`}
              >
                <span>{ut}</span>
                {value === ut && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </button>
            ))}

            {/* Empty State */}
            {!isAllIndiaMatch && filteredStates.length === 0 && filteredUTs.length === 0 && (
              <div className="px-3 py-3 text-center text-slate-400 font-medium">
                No matching location found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
