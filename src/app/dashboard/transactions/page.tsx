import { CreateTransaction } from "@/app/ui/transactions/buttons";
import DashboardTable from "@/app/ui/transactions/table";

export default async function Page() {
  return (
    <div className="w-full">
      <div>
        <CreateTransaction />
      </div>
      <DashboardTable />
    </div>
  );
}
