"use client";
import React from "react";
import { DownloadCSVButton } from "./buttons";
import { fetchAllTransactions } from "@/app/lib/data";

import useSWR from "swr";

const fetcher = (...args: [RequestInfo, RequestInit?]): Promise<any> =>
  fetch(...args).then((res) => res.json());

interface DownloadCSVProps {
  userId: string; // Array of objects with string keys and any type values
  fileName: string;
  data: Record<string, any>[];
}

//TODO check if we can add a server action that retrieves all the transactions
// async function getData(userId: string): Promise<Record<string, any>[]> {
//   const data2 = await fetchAllTransactions(userId);

//   return data2;
// }

const DownloadCSV: React.FC<DownloadCSVProps> = ({ userId, fileName }) => {
  const { data, error, isLoading } = useSWR(
    `/api/transactions/${userId}`,
    fetcher,
  );

  const convertToCSV = (objArray: Record<string, any>[]): string => {
    const array =
      typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
    let str = "";

    for (let i = 0; i < array.length; i++) {
      let line = "";
      for (let index in array[i]) {
        if (line !== "") line += ",";

        line += array[i][index];
      }
      str += line + "\r\n";
    }
    return str;
  };

  const downloadCSV = (): void => {
    const csvData = new Blob([convertToCSV(data.data)], { type: "text/csv" });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvURL;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return <DownloadCSVButton clickHandler={downloadCSV}></DownloadCSVButton>;
};

export default DownloadCSV;
