import SideNav from "@/app/ui/dashboard/sidenav";
import ThemeToggle from "@/app/ui/dashboard/theme-toggle";
import { verifySession } from "@/app/lib/dal";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const userId = session?.user?.id ?? "";

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow px-3 py-2 md:overflow-y-auto md:p-12">
        <div className="flex justify-end mb-2 md:mb-4">
          <ThemeToggle userId={userId} />
        </div>
        {children}
      </div>
    </div>
  );
}
