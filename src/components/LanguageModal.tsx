import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { locales, currencies, suggestedLocale } from "@/data/locales";
import { useLocale } from "@/contexts/LocaleContext";
import { useState, useEffect } from "react";

interface LanguageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LanguageModal = ({ open, onOpenChange }: LanguageModalProps) => {
  const { locale, currency, setLocale, setCurrency, t } = useLocale();
  const [tempLocale, setTempLocale] = useState(locale);
  const [tempCurrency, setTempCurrency] = useState(currency);

  // Reset temp states when modal opens or when saved values change
  useEffect(() => {
    setTempLocale(locale);
    setTempCurrency(currency);
  }, [locale, currency, open]);

  const handleLocaleSelect = (localeCode: string) => {
    setTempLocale(localeCode);
  };

  const handleCurrencySelect = (currencyCode: string) => {
    setTempCurrency(currencyCode);
  };

  const handleSave = () => {
    setLocale(tempLocale);
    setCurrency(tempCurrency);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-semibold">
            {t("languageModal.title")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {/* Suggested Language */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("languageModal.suggested")}</h3>
              <Button
                variant="outline"
                className="w-full justify-between h-auto p-4 text-left hover:border-foreground"
                onClick={() => handleLocaleSelect(suggestedLocale.code)}
              >
                <span className="font-medium">{suggestedLocale.nativeName}</span>
                {tempLocale === suggestedLocale.code && (
                  <Check className="h-5 w-5 text-foreground" />
                )}
              </Button>
            </div>

            {/* Choose Language and Region */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("languageModal.chooseLanguage")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {locales.map((loc) => (
                  <Button
                    key={loc.code}
                    variant="outline"
                    className="justify-between h-auto p-4 text-left hover:border-foreground"
                    onClick={() => handleLocaleSelect(loc.code)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{loc.language}</span>
                      <span className="text-xs text-muted-foreground">{loc.region}</span>
                    </div>
                    {tempLocale === loc.code && (
                      <Check className="h-5 w-5 text-foreground flex-shrink-0" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Choose Currency */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("languageModal.chooseCurrency")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currencies.map((curr) => (
                  <Button
                    key={curr.code}
                    variant="outline"
                    className="justify-between h-auto p-4 text-left hover:border-foreground"
                    onClick={() => handleCurrencySelect(curr.code)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">
                        {curr.code} - {curr.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{curr.symbol}</span>
                    </div>
                    {tempCurrency === curr.code && (
                      <Check className="h-5 w-5 text-foreground flex-shrink-0" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="border-t border-border p-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("languageModal.cancel")}
          </Button>
          <Button
            onClick={handleSave}
          >
            {t("languageModal.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
