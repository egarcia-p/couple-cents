// Shared color palette for charts
export const COLOR_PALETTE = [
  { bg: "rgba(255, 99, 132, 0.2)", border: "rgba(255, 99, 132, 1)" },
  { bg: "rgba(54, 162, 235, 0.2)", border: "rgba(54, 162, 235, 1)" },
  { bg: "rgba(75, 192, 192, 0.2)", border: "rgba(75, 192, 192, 1)" },
  { bg: "rgba(255, 206, 86, 0.2)", border: "rgba(255, 206, 86, 1)" },
  { bg: "rgba(153, 102, 255, 0.2)", border: "rgba(153, 102, 255, 1)" },
  { bg: "rgba(255, 159, 64, 0.2)", border: "rgba(255, 159, 64, 1)" },
  { bg: "rgba(255, 99, 64, 0.2)", border: "rgba(255, 99, 64, 1)" },
  { bg: "rgba(54, 162, 64, 0.2)", border: "rgba(54, 162, 64, 1)" },
  { bg: "rgba(255, 206, 132, 0.2)", border: "rgba(255, 206, 132, 1)" },
  { bg: "rgba(75, 192, 235, 0.2)", border: "rgba(75, 192, 235, 1)" },
  { bg: "rgba(153, 102, 86, 0.2)", border: "rgba(153, 102, 86, 1)" },
  { bg: "rgba(255, 159, 192, 0.2)", border: "rgba(255, 159, 192, 1)" },
  { bg: "rgba(255, 99, 255, 0.2)", border: "rgba(255, 99, 255, 1)" },
  { bg: "rgba(54, 162, 99, 0.2)", border: "rgba(54, 162, 99, 1)" },
  { bg: "rgba(255, 206, 153, 0.2)", border: "rgba(255, 206, 153, 1)" },
  { bg: "rgba(75, 192, 64, 0.2)", border: "rgba(75, 192, 64, 1)" },
  { bg: "rgba(153, 102, 235, 0.2)", border: "rgba(153, 102, 235, 1)" },
  { bg: "rgba(255, 159, 132, 0.2)", border: "rgba(255, 159, 132, 1)" },
];

/**
 * Generates a consistent hash for a category name.
 * Same category always returns same hash value.
 */
function hashCategory(category: string): number {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    const char = category.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % COLOR_PALETTE.length;
}

/**
 * Get consistent colors for a category.
 * Same category always gets same colors regardless of position.
 */
export function getCategoryColor(category: string) {
  const index = hashCategory(category);
  return COLOR_PALETTE[index];
}

/**
 * Get colors for an array of categories.
 * Useful for mapping multiple categories to their respective colors.
 */
export function getCategoryColors(categories: string[]) {
  return categories.map((category) => {
    const color = getCategoryColor(category);
    return {
      category,
      backgroundColor: color.bg,
      borderColor: color.border,
    };
  });
}
