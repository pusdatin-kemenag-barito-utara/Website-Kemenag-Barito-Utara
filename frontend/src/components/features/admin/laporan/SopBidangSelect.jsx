// src/components/features/admin/laporan/SopBidangSelect.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";

export const DEFAULT_BIDANG_LIST = [
  "Layanan Sub Bagian Tata Usaha",
  "Layanan Pendidikan Madrasah",
  "Layanan Pendidikan Agama Islam",
  "Layanan Pendidikan Diniyah dan Pontren",
  "Layanan Bimbingan Masyarakat Islam",
  "Layanan Bimbingan Masyarakat Kristen & Katolik",
  "Layanan Penyelenggara Zakat dan Wakaf",
  "Layanan Penyelenggara Hindu",
];

export default function SopBidangSelect({
  value = "",
  onChange,
  options = DEFAULT_BIDANG_LIST,
  label = "SOP Bidang / Unit Layanan",
  required = true,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedValue = value || options[0] || "";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={`space-y-1.5 relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex w-full h-11 items-center justify-between rounded-xl border bg-slate-50/60 px-3.5 text-xs font-bold transition-all text-left outline-none ${
          isOpen
            ? "border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-slate-900"
            : "border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <span className="truncate text-slate-900 dark:text-white font-bold">
            {selectedValue}
          </span>
        </div>

        <div
          className={`shrink-0 ml-2 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
          {/* Quick Search if more than 5 options */}
          {options.length > 5 && (
            <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari unit bidang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 pl-7 text-[11px] font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  autoFocus
                />
                <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValue === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-black dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors ${
                          isSelected
                            ? "bg-emerald-600 dark:bg-emerald-400"
                            : "bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-600"
                        }`}
                      />
                      <span className="truncate">{option}</span>
                    </div>

                    {isSelected && (
                      <span className="shrink-0 text-emerald-600 dark:text-emerald-400 ml-2">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400 font-medium">
                Unit bidang tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
