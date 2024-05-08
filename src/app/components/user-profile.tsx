/* eslint-disable @next/next/no-img-element */
import { auth } from "../../auth";

export default async function UserAvatar() {
  const session = await auth();

  if (!session) return null;

  if (!session.user) return null;
  if (!session.user.image) return null;

  return (
    <div className="w-full md:col-span-4">
      <label htmlFor="user" className="mb-2 block text-sm font-medium">
        Username:
      </label>
      <div className="relative"> {session.user.name}</div>
      <div className="relative">
        <img src={session.user.image} alt="user avatar"></img>
      </div>
    </div>
  );
}
