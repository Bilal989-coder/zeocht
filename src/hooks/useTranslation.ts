import { useLocale } from "@/contexts/LocaleContext";

export const useTranslation = () => {
  const { t, formatPrice } = useLocale();
  
  return {
    t,
    formatPrice,
  };
};
