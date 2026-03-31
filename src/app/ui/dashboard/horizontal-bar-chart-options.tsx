import locales from "@/i18n/locales.json";

function getCurrency(locale: string): string {
  const found = locales.find((l) => l.key === locale);
  return found?.currency ?? "USD";
}

export default function getHorizontalBarChartOptions(
  locale: string,
  isDark = false,
) {
  const currency = getCurrency(locale);
  const textColor = isDark ? "#d1d5db" : undefined;
  const gridColor = isDark ? "rgba(75, 85, 99, 0.3)" : undefined;

  return {
    indexAxis: "y" as const,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          callback: function (value: any): string {
            return new Intl.NumberFormat(locale, {
              style: "currency",
              currency,
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
        grid: { color: gridColor },
      },
      y: {
        ticks: {
          color: textColor,
          autoSkip: false,
          maxRotation: 90,
          minRotation: 0,
        },
        grid: { color: gridColor },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
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
