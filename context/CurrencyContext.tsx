"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CurrencyMode = "INR" | "USD";

interface CurrencyContextType {
  currencyMode: CurrencyMode;
  setCurrencyMode: (mode: CurrencyMode) => void;
  toggleCurrencyMode: () => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencyMode: "INR",
  setCurrencyMode: () => {},
  toggleCurrencyMode: () => {},
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyMode, setCurrencyModeState] = useState<CurrencyMode>("INR");

  useEffect(() => {
    // Read saved preference from localStorage if present
    const saved = localStorage.getItem("dvr_currency_mode");
    if (saved === "USD" || saved === "INR") {
      setCurrencyModeState(saved);
    }
  }, []);

  const setCurrencyMode = (mode: CurrencyMode) => {
    setCurrencyModeState(mode);
    try {
      localStorage.setItem("dvr_currency_mode", mode);
    } catch (e) {
      // Ignore storage errors
    }
  };

  const toggleCurrencyMode = () => {
    setCurrencyMode(currencyMode === "INR" ? "USD" : "INR");
  };

  return (
    <CurrencyContext.Provider value={{ currencyMode, setCurrencyMode, toggleCurrencyMode }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
