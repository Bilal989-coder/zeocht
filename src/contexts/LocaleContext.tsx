import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { locales, currencies, suggestedLocale } from "@/data/locales";

interface LocaleContextType {
  locale: string;
  currency: string;
  setLocale: (locale: string) => void;
  setCurrency: (currency: string) => void;
  t: (key: string) => string;
  formatPrice: (price: number) => string;
  getLocaleName: () => string;
  getCurrencyName: () => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
};

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
    const saved = localStorage.getItem("locale");
    return saved || suggestedLocale.code;
  });

  const [currency, setCurrencyState] = useState<string>(() => {
    const saved = localStorage.getItem("currency");
    return saved || "USD";
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load translations for the current locale
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const translationModule = await import(`@/locales/${locale}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error(`Failed to load translations for ${locale}`, error);
        // Fallback to English
        try {
          const fallbackModule = await import(`@/locales/en-US.json`);
          setTranslations(fallbackModule.default);
        } catch (fallbackError) {
          console.error("Failed to load fallback translations", fallbackError);
          setTranslations({});
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [locale]);

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  const formatPrice = (price: number): string => {
    const currencyData = currencies.find((c) => c.code === currency);
    if (!currencyData) return `$${price}`;

    // Simple exchange rates (in production, use a real API)
    const exchangeRates: Record<string, number> = {
      USD: 1,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.5,
      CAD: 1.36,
      AUD: 1.52,
      CHF: 0.88,
      CNY: 7.24,
      MXN: 17.2,
      BRL: 4.97,
      INR: 83.12,
      KRW: 1329,
      SEK: 10.33,
      NOK: 10.58,
      DKK: 6.87,
      PLN: 3.95,
      TRY: 32.15,
      RUB: 92.5,
      THB: 35.8,
      AED: 3.67,
    };

    const convertedPrice = price * (exchangeRates[currency] || 1);
    const symbol = currencyData.symbol;

    // Format based on locale
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedPrice);

    // Some currencies place symbol after the amount
    const symbolAfter = ["EUR", "SEK", "NOK", "DKK", "PLN", "TRY", "RUB"];
    
    if (symbolAfter.includes(currency)) {
      return `${formattedNumber} ${symbol}`;
    }
    
    return `${symbol}${formattedNumber}`;
  };

  const getLocaleName = (): string => {
    const localeData = locales.find((l) => l.code === locale);
    return localeData?.nativeName || "English (United States)";
  };

  const getCurrencyName = (): string => {
    const currencyData = currencies.find((c) => c.code === currency);
    return currencyData ? `${currencyData.code} - ${currencyData.name}` : "USD - United States Dollar";
  };

  // Always provide the context value, even while loading
  const contextValue: LocaleContextType = {
    locale,
    currency,
    setLocale,
    setCurrency,
    t,
    formatPrice,
    getLocaleName,
    getCurrencyName,
  };

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
};
