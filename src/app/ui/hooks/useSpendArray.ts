import categories from "@/app/lib/data/categories.json";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

interface Categories {
  [key: string]: string;
}

interface UseSpendArrayProps {
  dataExpenses: Map<string, number>;
}

export function useSpendArray({ dataExpenses }: UseSpendArrayProps) {
  //Conver Info into data array
  const allCategories = categories as Categories;
  const t = useTranslations("ExpensesCategoryChart");
  const tCategories = useTranslations("Categories");

  let spendArray = new Array<number>();
  let categoryArray = new Array<string>();
  Object.keys(allCategories).forEach((categoryKey) => {
    spendArray.push(dataExpenses.get(categoryKey) ?? 0);
    categoryArray.push(tCategories(categoryKey));
  });

  return { spendArray, categoryArray };
}
