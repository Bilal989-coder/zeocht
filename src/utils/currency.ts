import { currencies } from "@/data/locales";

export const formatCurrency = (
  amount: number,
  currencyCode: string,
  locale: string
): string => {
  const currency = currencies.find((c) => c.code === currencyCode);
  if (!currency) return `$${amount}`;

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

  const convertedAmount = amount * (exchangeRates[currencyCode] || 1);
  
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(convertedAmount);

  const symbolAfter = ["EUR", "SEK", "NOK", "DKK", "PLN", "TRY", "RUB"];
  
  if (symbolAfter.includes(currencyCode)) {
    return `${formattedNumber} ${currency.symbol}`;
  }
  
  return `${currency.symbol}${formattedNumber}`;
};
