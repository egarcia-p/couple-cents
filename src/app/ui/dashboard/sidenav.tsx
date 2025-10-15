"use client";

import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import logo from "../../../../public/logo.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";
import { useTranslations } from "next-intl";

export default function SideNav() {
  const router = useRouter();
  const t = useTranslations("NavLinks");

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await router.push("/");
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  return (
    <div className="flex h-full flex-col px-3 py-2 md:px-2 md:py-4">
      <Link className="" href="/">
        <div className="mb-2 flex md:flex-col h-16 justify-between rounded-md bg-primary-600 p-4 md:h-44">
          <div className="w-20 h-auto md:m-auto text-white md:w-40">
            <Image src={logo} alt="Logo" />
          </div>
          <div className="w-full m-auto text-secondary md:w-40 md:text-center">
            <p className=" text-lg">{t("title")}</p>
          </div>
          <div className="m-auto text-secondary md:w-40 md:text-center">
            <p className=" text-sm">v0.5.3</p>
          </div>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

        <button
          onClick={handleSignOut}
          className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-primary-100 hover:text-black-600 md:flex-none md:justify-start md:p-2 md:px-3"
        >
          <ArrowLeftEndOnRectangleIcon className="w-6" />
          <div className="hidden md:block">{t("signout")}</div>
        </button>
      </div>
    </div>
  );
}
