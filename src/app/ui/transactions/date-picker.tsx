"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { DateValueType } from "react-tailwindcss-datepicker";
import { useTranslations } from "next-intl";

const WAIT_BETWEEN_KEY_PRESS = 1000;

export default function DatePicker({
  placeholder,
  locale,
}: {
  placeholder: string;
  locale: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const t = useTranslations("DatePicker");

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
          i18n={locale}
          showShortcuts={true}
          showFooter={true}
          primaryColor={"green"}
          value={value}
          configs={{
            shortcuts: {
              today: t("today"),
              yesterday: t("yesterday"),
              past: (period) => `${t("prefixPeriod")}${period}`,
              currentMonth: t("currentMonth"),
              pastMonth: t("pastMonth"),
            },
            footer: {
              cancel: t("cancel"),
              apply: t("apply"),
            },
          }}
          onChange={handleValueChange}
        />
      </div>
    </div>
  );
}
