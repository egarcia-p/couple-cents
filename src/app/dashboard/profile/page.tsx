import { auth } from "@/auth";
import { Metadata } from "next";
import UserAvatar from "../../components/profile/user-profile";
import Link from "next/link";
import UserSettings from "@/app/components/profile/settings";
import { userBudgetSettings } from "../../../../drizzle/schema";
import { fetchUserBudgetSettings } from "@/app/lib/data";
import { UserBudgetSetting } from "@/app/lib/definitions";

export const metadata: Metadata = {
  title: "Profile",
};
export default async function Page() {
  const session = await auth();
  if (!session)
    return (
      <div>
        Not authenticated <Link href="/">Go to main page</Link>
      </div>
    );

  const userId = session.user?.id;
  if (!userId)
    return (
      <div>
        Not authenticated <Link href="/">Go to main page</Link>
      </div>
    );

  const userBudgetSettingsData: UserBudgetSetting[] =
    await fetchUserBudgetSettings(userId);

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Profile Settings</h1>
      <UserAvatar />
      <UserSettings userId={userId} budgetSettings={userBudgetSettingsData} />
    </main>
  );
}
