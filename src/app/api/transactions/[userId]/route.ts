import { and, or, ilike, sql, eq, count, sum, desc } from "drizzle-orm";
import _categories from "@/app/lib/data/categories.json";
import _categoriesIncome from "@/app/lib/data/categoriesForIncome.json";
import { auth } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchAllTransactions } from "@/app/lib/data";

interface ICategories {
  [key: string]: string;
}

type ResponseData = {
  message: string;
  data: Record<string, any>[];
};

const categoriesMap: ICategories = { ..._categories, ..._categoriesIncome };

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  const session = await auth();

  if (!session || !session.user || session.user.id != params.userId) {
    return Response.json(
      {
        message: "Unauthenticated user or wrong user",
        data: [],
      },
      { status: 401 },
    );
  } else {
    const data = await fetchAllTransactions(params.userId);

    return Response.json({ message: "Success", data }, { status: 200 });
  }
}
