"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker";

const WAIT_BETWEEN_KEY_PRESS = 1000;

export default function DatePicker({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [value, setValue] = useState<DateValueType>({
    startDate: new Date(),
    endDate: new Date(),
  });

  const handleValueChange = (newValue: DateValueType) => {
    console.log("newValue:", newValue);
    setValue(newValue);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    // Perform search logic here
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    params.set("page", "1");

    replace(`${pathname}?${params.toString()}`);
  }, WAIT_BETWEEN_KEY_PRESS);

  return (
    <div className="">
      <div className="">
        <Datepicker value={value} onChange={handleValueChange} />
      </div>
    </div>
  );
}
