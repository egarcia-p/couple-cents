/* eslint-disable @next/next/no-img-element */
import { auth } from "@/app/lib/auth";
import { verifySession } from "@/app/lib/dal";
import { headers } from "next/headers";

export default async function UserAvatar() {
  const session = await verifySession();
  if (!session) return null;

  const image =
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 ">
          <div className="flex">
            <div className="h-16 w-16 overflow-hidden rounded-full">
              <img
                className="object-contain"
                src={image}
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
