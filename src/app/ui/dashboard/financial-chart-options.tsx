import locales from "@/i18n/locales.json";

function getCurrency(locale: string): string {
  const found = locales.find((l) => l.key === locale);
  return found?.currency ?? "USD";
}

export default function getFinancialChartOptions(locale: string) {
  const currency = getCurrency(locale);

  return {
    scales: {
      y: {
        ticks: {
          callback: function (value: any): string {
            return new Intl.NumberFormat(locale, {
              style: "currency",
              currency,
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            const value = context.parsed.y ?? context.parsed;
            if (value !== null && value !== undefined) {
              label += new Intl.NumberFormat(locale, {
                style: "currency",
                currency,
                minimumFractionDigits: 0,
              }).format(value);
            }
            return label;
          },
        },
      },
    },
  };
}
