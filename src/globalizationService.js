export const supportedLocales = ["pt-BR", "en-US", "es-ES"];
export const supportedCurrencies = ["BRL", "USD", "EUR"];

export function getGlobalizationConfig() {
  return {
    locales: supportedLocales,
    currencies: supportedCurrencies,
    defaultLocale: "pt-BR",
    defaultCurrency: "BRL",
  };
}
