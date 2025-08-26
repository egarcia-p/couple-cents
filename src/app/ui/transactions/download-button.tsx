"use client";
import React from "react";
import { DownloadCSVButton } from "./buttons";
import useSWR from "swr";

const fetcher = (...args: [RequestInfo, RequestInit?]): Promise<any> =>
  fetch(...args).then((res) => res.json());

interface DownloadCSVProps {
  userId: string; // Array of objects with string keys and any type values
  fileName: string;
  dates: string;
  query: string;
}

const DownloadCSV: React.FC<DownloadCSVProps> = ({
  userId,
  fileName,
  dates,
  query,
}) => {
  const { data, error, mutate } = useSWR(
    `/api/transactions/${userId}/?query=${query}&dates=${dates}`,
    fetcher,
    { revalidateOnMount: false }, // Prevent automatic fetching if needed
  );

  const convertToCSV = (objArray: Record<string, any>[]): string => {
    const array =
      typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
    let str = "";

    for (let i = 0; i < array.length; i++) {
      let line = "";
      for (let index in array[i]) {
        if (line !== "") line += "|";
        line += array[i][index];
      }
      str += line + "\r\n";
    }
    return str;
  };

  const handleDownload = async () => {
    // Fetch data only when button is clicked
    const result = await mutate();

    if (result && result.data) {
      const csvData = new Blob([convertToCSV(result.data)], {
        type: "text/csv",
      });
      const csvURL = URL.createObjectURL(csvData);
      const link = document.createElement("a");
      link.href = csvURL;
      link.download = `${fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return <DownloadCSVButton clickHandler={handleDownload} />;
};

export default DownloadCSV;
