import locales from "@/i18n/locales.json";

function getCurrency(locale: string): string {
  const found = locales.find((l) => l.key === locale);
  return found?.currency ?? "USD";
}

export default function getFinancialChartOptions(
  locale: string,
  isDark = false,
) {
  const currency = getCurrency(locale);
  const textColor = isDark ? "#d1d5db" : undefined;
  const gridColor = isDark ? "rgba(75, 85, 99, 0.3)" : undefined;

  return {
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
    plugins: {
      legend: {
        labels: { color: textColor },
      },
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
