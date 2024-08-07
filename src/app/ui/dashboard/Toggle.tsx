"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Toggle() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleToggle = (term: boolean) => {
    // Perform search logic here
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("period", "Year");
    } else {
      params.set("period", "Month");
    }

    replace(`${pathname}?${params.toString()}`);
  };
  return (
    <div className="relative flex flex-row my-4 gap-2">
      <div>Month</div>
      <div className=" rounded">
        <input
          id="one"
          onChange={(event) => handleToggle(event.target.checked)}
          type="checkbox"
        />
      </div>
      <div>Year</div>
    </div>
  );
}
