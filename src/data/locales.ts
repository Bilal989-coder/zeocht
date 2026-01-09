export interface Locale {
  code: string;
  language: string;
  region: string;
  nativeName: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const suggestedLocale: Locale = {
  code: "en-US",
  language: "English",
  region: "United States",
  nativeName: "English (United States)",
};

export const locales: Locale[] = [
  { code: "en-US", language: "English", region: "United States", nativeName: "English (United States)" },
  { code: "en-GB", language: "English", region: "United Kingdom", nativeName: "English (United Kingdom)" },
  { code: "en-CA", language: "English", region: "Canada", nativeName: "English (Canada)" },
  { code: "en-AU", language: "English", region: "Australia", nativeName: "English (Australia)" },
  { code: "es-ES", language: "Español", region: "España", nativeName: "Español (España)" },
  { code: "es-MX", language: "Español", region: "México", nativeName: "Español (México)" },
  { code: "es-AR", language: "Español", region: "Argentina", nativeName: "Español (Argentina)" },
  { code: "es-CO", language: "Español", region: "Colombia", nativeName: "Español (Colombia)" },
  { code: "fr-FR", language: "Français", region: "France", nativeName: "Français (France)" },
  { code: "fr-CA", language: "Français", region: "Canada", nativeName: "Français (Canada)" },
  { code: "de-DE", language: "Deutsch", region: "Deutschland", nativeName: "Deutsch (Deutschland)" },
  { code: "de-AT", language: "Deutsch", region: "Österreich", nativeName: "Deutsch (Österreich)" },
  { code: "it-IT", language: "Italiano", region: "Italia", nativeName: "Italiano (Italia)" },
  { code: "pt-BR", language: "Português", region: "Brasil", nativeName: "Português (Brasil)" },
  { code: "pt-PT", language: "Português", region: "Portugal", nativeName: "Português (Portugal)" },
  { code: "nl-NL", language: "Nederlands", region: "Nederland", nativeName: "Nederlands (Nederland)" },
  { code: "pl-PL", language: "Polski", region: "Polska", nativeName: "Polski (Polska)" },
  { code: "ru-RU", language: "Русский", region: "Россия", nativeName: "Русский (Россия)" },
  { code: "ja-JP", language: "日本語", region: "日本", nativeName: "日本語 (日本)" },
  { code: "ko-KR", language: "한국어", region: "대한민국", nativeName: "한국어 (대한민국)" },
  { code: "zh-CN", language: "中文", region: "中国", nativeName: "中文 (中国)" },
  { code: "zh-TW", language: "中文", region: "台灣", nativeName: "中文 (台灣)" },
  { code: "tr-TR", language: "Türkçe", region: "Türkiye", nativeName: "Türkçe (Türkiye)" },
  { code: "ar-SA", language: "العربية", region: "السعودية", nativeName: "العربية (السعودية)" },
  { code: "he-IL", language: "עברית", region: "ישראל", nativeName: "עברית (ישראל)" },
  { code: "sv-SE", language: "Svenska", region: "Sverige", nativeName: "Svenska (Sverige)" },
  { code: "no-NO", language: "Norsk", region: "Norge", nativeName: "Norsk (Norge)" },
  { code: "da-DK", language: "Dansk", region: "Danmark", nativeName: "Dansk (Danmark)" },
  { code: "fi-FI", language: "Suomi", region: "Suomi", nativeName: "Suomi (Suomi)" },
  { code: "cs-CZ", language: "Čeština", region: "Česko", nativeName: "Čeština (Česko)" },
  { code: "el-GR", language: "Ελληνικά", region: "Ελλάδα", nativeName: "Ελληνικά (Ελλάδα)" },
  { code: "th-TH", language: "ไทย", region: "ไทย", nativeName: "ไทย (ไทย)" },
  { code: "vi-VN", language: "Tiếng Việt", region: "Việt Nam", nativeName: "Tiếng Việt (Việt Nam)" },
  { code: "id-ID", language: "Bahasa Indonesia", region: "Indonesia", nativeName: "Bahasa Indonesia (Indonesia)" },
  { code: "hi-IN", language: "हिन्दी", region: "भारत", nativeName: "हिन्दी (भारत)" },
];

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "United States Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];
