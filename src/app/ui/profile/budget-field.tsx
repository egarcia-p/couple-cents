export function BudgetField({
  categoryId,
  category,
  budget,
  onBudgetChange,
}: {
  categoryId: string;
  category: string;
  budget: string;
  onBudgetChange: (categoryId: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 w-1/4 content-start gap-4">
      <div className="flex">
        <span className="text-gray-700">{category}</span>
      </div>
      <div className="flex w-full">
        <input
          id={`budget-${categoryId}`}
          name={`budget-${categoryId}`}
          type="number"
          defaultValue={budget}
          onChange={(e) => onBudgetChange(categoryId, e.target.value)}
          step="1"
          className="ml-4 rounded border border-gray-300 p-1"
        />
      </div>
    </div>
  );
}
