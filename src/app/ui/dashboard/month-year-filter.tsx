"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { set } from "zod";

export default function Filter({
  months,
  years,
}: {
  months: [[string, string]];
  years: Object;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);

    params.set("month", event.target.value);
    replace(`${pathname}?${params.toString()}`);
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);

    params.set("year", event.target.value);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-row my-4 gap-2">
      <div>Month</div>
      <div className="rounded">
        <select
          id="month"
          name="month"
          className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          defaultValue=""
          aria-describedby="month-error"
          onChange={handleMonthChange}
        >
          <option value="" disabled>
            Select a month
          </option>
          {months.map(([key, month]: [string, string]) => (
            <option key={key} value={key}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div>Year</div>
      <div className="rounded">
        <select
          id="year"
          name="year"
          className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
          defaultValue=""
          aria-describedby="year-error"
          onChange={handleYearChange}
        >
          <option value="" disabled>
            Select a year
          </option>
          {Object.entries(years).map(([key, value]: [string, string]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
