import Link from "next/link";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { signOut } from "@/auth";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import logo from "../../../../public/logo.svg";
import Image from "next/image";

export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link className="" href="/">
        <div className="mb-2 flex md:flex-col h-20 items-end justify-start rounded-md bg-primary-600 p-4 md:h-40">
          <div className="w-24 h-auto md:m-auto text-white md:w-40">
            <Image src={logo} alt="Logo" />
          </div>
          <div className="w-full m-auto text-secondary md:w-40 md:text-center">
            <p className=" text-lg">CoupleCents</p>
          </div>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-primary-100 hover:text-black-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <ArrowLeftEndOnRectangleIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
