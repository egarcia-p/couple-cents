import { Metadata } from "next";
import UserAvatar from "@/app/components/profile/user-profile";
import UserSettings from "@/app/components/profile/settings";
import {
  fetchUserBudgetSettings,
  fetchUserSettings,
  fetchUserTags,
} from "@/app/lib/data";
import type {
  UserBudgetSetting,
  Tag,
  UserSettings as UserSettingsType,
} from "@/app/lib/definitions";
import { verifySession } from "@/app/lib/dal";

export const metadata: Metadata = {
  title: "Profile",
};
export default async function Page() {
  const session = await verifySession();
  if (!session) return null;

  const userId = session.user?.id;

  const [userBudgetSettingsData, userSettingsData, userTags] =
    await Promise.all([
      fetchUserBudgetSettings(userId),
      fetchUserSettings(userId),
      fetchUserTags(userId),
    ]);

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Profile Settings</h1>
      <UserAvatar />
      <UserSettings
        userId={userId}
        budgetSettings={userBudgetSettingsData}
        userSettings={userSettingsData[0]!}
        tags={userTags}
      />
    </main>
  );
}
