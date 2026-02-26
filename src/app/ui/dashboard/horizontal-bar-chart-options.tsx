import locales from "@/i18n/locales.json";

function getCurrency(locale: string): string {
  const found = locales.find((l) => l.key === locale);
  return found?.currency ?? "USD";
}

export default function getHorizontalBarChartOptions(locale: string) {
  const currency = getCurrency(locale);

  return {
    indexAxis: "y" as const,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
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
      y: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 0,
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
            const value = context.parsed.x ?? context.parsed;
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
