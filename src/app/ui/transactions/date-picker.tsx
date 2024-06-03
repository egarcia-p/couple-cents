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

  var date = new Date();
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const [value, setValue] = useState<DateValueType>({
    startDate: firstDay,
    endDate: lastDay,
  });

  const handleValueChange = (newValue: DateValueType) => {
    setValue(newValue);
    const params = new URLSearchParams(searchParams);
    if (newValue?.startDate) {
      params.set("dates", newValue.startDate + "to" + newValue.endDate);
    } else {
      params.delete("dates");
    }
    params.set("page", "1");

    replace(`${pathname}?${params.toString()}`);
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
        <Datepicker
          showShortcuts={true}
          showFooter={true}
          primaryColor={"green"}
          value={value}
          configs={{
            shortcuts: {
              today: "Today",
              yesterday: "Yesterday",
              past: (period) => `P-${period}`,
              currentMonth: "Current Month",
              pastMonth: "Past Month",
            },
            footer: {
              cancel: "Cancel",
              apply: "Apply",
            },
          }}
          onChange={handleValueChange}
        />
      </div>
    </div>
  );
}
