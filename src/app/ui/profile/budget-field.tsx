export function BudgetField({
  category,
  budget,
}: {
  category: string;
  budget: number;
}) {
  return (
    <div className="grid grid-cols-2 w-1/4 content-start gap-4">
      <div className="flex">
        <span className="text-gray-700">{category}</span>
      </div>
      <div className="flex w-full">
        <input
          type="number"
          value={budget}
          className="ml-4 rounded border border-gray-300 p-1"
        />
      </div>
    </div>
  );
}
