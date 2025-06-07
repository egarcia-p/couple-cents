/* eslint-disable @next/next/no-img-element */
import { auth } from "../../../auth";

export default async function UserAvatar() {
  const session = await auth();

  if (!session) return null;

  if (!session.user) return null;
  if (!session.user.image) return null;

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 ">
          <div className="flex">
            <div className="h-16 w-16 overflow-hidden rounded-full">
              <img
                className="object-contain"
                src={session.user.image}
                alt="user avatar"
              ></img>
            </div>
            <div className="ml-4 flex flex-col justify-center">
              <h1 className="text-lg font-bold">{session.user.name}</h1>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
