// Currency codes and their symbols
export const CURRENCIES = {
  SLE: { code: "SLE", symbol: "Le", name: "Sierra Leone Leone" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
