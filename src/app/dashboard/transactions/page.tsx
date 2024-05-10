import { CreateTransaction } from "@/app/ui/transactions/buttons";
import DashboardTable from "@/app/ui/transactions/table";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;
  if (!session.user) return <div>Not authenticated</div>;
  if (!session.user.id) return <div>Not authenticated</div>;

  return (
    <div className="w-full">
      <div>
        <CreateTransaction />
      </div>
      <DashboardTable userId={session.user.id} />
    </div>
  );
}
