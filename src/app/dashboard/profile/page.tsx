import { auth } from "@/auth";
import { Metadata } from "next";
import UserAvatar from "../../components/profile/user-profile";
import Link from "next/link";
import UserSettings from "@/app/components/profile/settings";

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

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Profile Settings</h1>
      <UserAvatar />
      <UserSettings />
    </main>
  );
}
