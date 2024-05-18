import { auth } from "@/auth";
import { Metadata } from "next";
import UserAvatar from "../../components/user-profile";

export const metadata: Metadata = {
  title: "Profile",
};
export default async function Page() {
  const session = await auth();
  if (!session) return <div>Not authenticated</div>;

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>Profile Settings</h1>
      <UserAvatar />
    </main>
  );
}
