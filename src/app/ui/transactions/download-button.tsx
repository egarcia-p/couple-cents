"use client";
import React from "react";
import { DownloadCSVButton } from "./buttons";
import { fetchAllTransactions } from "@/app/lib/data";

interface DownloadCSVProps {
  data: Record<string, any>[]; // Array of objects with string keys and any type values
  fileName: string;
}

//TODO check if we can add a server action that retrieves all the transactions
async (userId: string) => {
  const data2 = fetchAllTransactions(userId);
};

const DownloadCSV: React.FC<DownloadCSVProps> = ({ data, fileName }) => {
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
    const csvData = new Blob([convertToCSV(data)], { type: "text/csv" });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.href = csvURL;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <DownloadCSVButton clickHandler={downloadCSV}></DownloadCSVButton>;
};

export default DownloadCSV;
