"use client";

import { BanknotesIcon, HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: BanknotesIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-black-600 md:flex-none md:justify-start md:p-2 md:px-3
          
            ${pathname === link.href ? "bg-red-100 text-black-600" : ""}
            `}
          >
            <LinkIcon className="w-6" />
            <span className="hidden md:block">{link.name}</span>
          </Link>
        );
      })}
    </>
  );
}
