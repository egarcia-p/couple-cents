import { and, or, ilike, sql, eq, count, sum, desc } from "drizzle-orm";
import { fetchAllFilteredTransactions } from "@/app/lib/data";
import { verifySession } from "@/app/lib/dal";

interface ICategories {
  [key: string]: string;
}

type ResponseData = {
  message: string;
  data: Record<string, any>[];
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const session = await verifySession();
  if (!session) {
    return Response.json(
      {
        message: "Unauthorized",
        data: [],
      },
      { status: 401 },
    );
  }

  if (!session.user || session.user.id != userId) {
    return Response.json(
      {
        message: "Unauthenticated user or wrong user",
        data: [],
      },
      { status: 401 },
    );
  } else {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const dates = searchParams.get("dates") || "";
    const tagIdsParam = searchParams.get("tagIds");
    const tagIds = tagIdsParam
      ? tagIdsParam.split(",").filter(Boolean)
      : undefined;

    const data = await fetchAllFilteredTransactions({
      query: query,
      userId: userId,
      dates: dates,
      tagIds: tagIds,
    });

    return Response.json({ message: "Success", data }, { status: 200 });
  }
}
