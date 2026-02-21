import { useTranslations } from "next-intl";
import { Categories } from "@/app/lib/definitions";
import { getExpenseCategories } from "@/app/lib/helpers/categories";

interface UseSpendArrayProps {
  dataExpenses: Map<string, number>;
}

export function useSpendArray({ dataExpenses }: UseSpendArrayProps) {
  const allCategories = getExpenseCategories();
  const tCategories = useTranslations("Categories");

  const spendArray: number[] = [];
  const categoryArray: string[] = [];

  Object.keys(allCategories).forEach((categoryKey) => {
    spendArray.push(dataExpenses.get(categoryKey) ?? 0);
    categoryArray.push(tCategories(categoryKey));
  });

  return { spendArray, categoryArray };
}
