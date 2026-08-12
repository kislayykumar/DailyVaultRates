"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Command, X, TrendingUp, ChevronRight, Building2, AlertCircle } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StockSearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  quoteType?: string;
}

interface StockSearchBarProps {
  onSelectStock: (symbol: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function StockSearchBar({ onSelectStock, isOpen: externalIsOpen, onClose }: StockSearchBarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    setQuery("");
    setDebouncedQuery("");
    setSelectedIndex(0);
  }, [onClose]);

  const handleOpen = useCallback(() => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(true);
    }
  }, [externalIsOpen]);

  // Handle Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, handleOpen]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const { data, error, isLoading } = useSWR(
    debouncedQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  const searchResults: StockSearchResult[] = data?.data || [];

  // Keyboard navigation inside modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        onSelectStock(searchResults[selectedIndex].symbol);
        handleClose();
      }
    }
  };

  const popularStocks = [
    { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd.", exchange: "NSE" },
    { symbol: "INFY.NS", name: "Infosys Limited", exchange: "NSE" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd.", exchange: "NSE" },
    { symbol: "TATAMOTORS.NS", name: "Tata Motors Ltd.", exchange: "NSE" },
  ];

  return (
    <>
      {/* ── Trigger Bar ────────────────────────────────────────── */}
      {externalIsOpen === undefined && (
        <button
          type="button"
          onClick={handleOpen}
          className="group relative flex w-full items-center justify-between rounded-2xl border border-emerald-500/20 bg-slate-900/60 px-4 py-3 text-left text-sm backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-emerald-500/5 focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-emerald-400 transition-transform group-hover:scale-110" />
            <span className="text-slate-400 font-medium group-hover:text-slate-300">
              Search Indian Stocks (e.g. Reliance, TCS, HDFC, INFY)…
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-[11px] font-bold text-slate-300">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </button>
      )}

      {/* ── Backdrop Modal Overlay ──────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
          onClick={handleClose}
          onKeyDown={handleModalKeyDown}
        >
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/95 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Line */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

            {/* Input Bar */}
            <div className="relative flex items-center border-b border-slate-800/80 px-4 py-3.5">
              <Search className="h-5 w-5 shrink-0 text-emerald-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search ticker or company (e.g. RELIANCE, TCS, INFY, TATAMOTORS)..."
                className="w-full bg-transparent px-3 text-base text-white placeholder-slate-500 outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="ml-2 rounded-lg border border-slate-800 bg-slate-800/50 px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                ESC
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {isLoading && (
                <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span>Searching Indian Equity Markets…</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Error fetching search results. Please try again.</span>
                </div>
              )}

              {!isLoading && !error && debouncedQuery.length >= 2 && searchResults.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No Indian stocks found matching &quot;<span className="text-white font-semibold">{debouncedQuery}</span>&quot;.
                </div>
              )}

              {/* Autocomplete List */}
              {searchResults.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-3 py-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Search Results ({searchResults.length})
                    </p>
                    {data?.suggestedQuery && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        ✨ Showing results for &quot;{data.suggestedQuery}&quot;
                      </span>
                    )}
                  </div>
                  {searchResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.symbol}
                        onClick={() => {
                          onSelectStock(item.symbol);
                          handleClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-white"
                            : "hover:bg-slate-800/60 border border-transparent text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold ${
                              isSelected
                                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                                : "border-slate-800 bg-slate-800/80 text-slate-400"
                            }`}
                          >
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-white">
                                {item.symbol}
                              </span>
                              <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-400">
                                {item.exchange}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {item.shortname || item.longname}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${
                            isSelected ? "text-emerald-400 translate-x-0.5" : "text-slate-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Default Popular Shortcuts when search input is empty */}
              {debouncedQuery.length < 2 && !isLoading && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span>Popular Blue-Chip Stocks</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                    {popularStocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => {
                          onSelectStock(stock.symbol);
                          handleClose();
                        }}
                        className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-left transition-all hover:border-emerald-500/30 hover:bg-slate-800/80 group"
                      >
                        <div>
                          <p className="font-mono text-xs font-bold text-white group-hover:text-emerald-400">
                            {stock.symbol}
                          </p>
                          <p className="text-[11px] text-slate-400">{stock.name}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">
                          {stock.exchange}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2.5 text-[11px] text-slate-500 bg-slate-950/40">
              <div className="flex items-center gap-3">
                <span>Use <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[10px]">↑</kbd> <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[10px]">↓</kbd> to navigate</span>
                <span><kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 font-mono text-[10px]">↵</kbd> to select</span>
              </div>
              <span className="text-emerald-400 font-semibold">NSE / BSE Realtime</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
