import { fetchTransactionPages, fetchUserTags } from "@/app/lib/data";
import Search from "@/app/ui/search";
import { CreateTransaction } from "@/app/ui/transactions/buttons";
import DatePicker from "@/app/ui/transactions/date-picker";
import Pagination from "@/app/ui/transactions/pagination";
import DashboardTable from "@/app/ui/transactions/table";
import DashboardTableMobile from "@/app/ui/transactions/table-mobile";
import { TagFilter } from "@/app/ui/transactions/tag-filter";
import { toZonedTime, format } from "date-fns-tz";
import { verifySession } from "@/app/lib/dal";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    query?: string;
    dates?: string;
    page?: string;
    tagIds?: string;
  }>;
}) {
  const session = await verifySession();
  if (!session) return null;

  const t = await getTranslations("TransactionsPage");
  const locale = (await cookies()).get("NEXT_LOCALE")?.value || "en-GB";

  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;
  const query = params?.query || "";
  const tagIds = params?.tagIds?.split(",").filter(Boolean) || [];

  //TBD Fix according to the user's timezone
  const timeZone = "America/Mexico_City";
  const utcDate = new Date();
  const mexicoDate = toZonedTime(utcDate, timeZone);
  const formattedMexicoDate = format(mexicoDate, "yyyy-MM-dd'T'HH:mm:ssXXX", {
    timeZone,
  });
  const formattedMexicoDateParts = formattedMexicoDate.split("T")[0];
  // Create first and last day of the month based on the user's timezone
  // This will ensure that the date range is correct regardless of the user's timezone
  // This is a temporary fix, ideally we should use the user's timezone to get the correct
  // first and last day of the month.
  const date = new Date(formattedMexicoDateParts);

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    .toLocaleDateString()
    .split("T")[0]
    .replace(/-/g, " ");
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    .toLocaleDateString()
    .split("T")[0]
    .replace(/-/g, " ");
  const dates = params?.dates || firstDay + "to" + lastDay;

  const [totalPages, userTags] = await Promise.all([
    fetchTransactionPages(
      query,
      dates,
      session.user.id,
      tagIds.length > 0 ? tagIds : undefined,
    ),
    fetchUserTags(session.user.id),
  ]);

  // console.warn("Date: new Date()", utcDate);
  // console.warn("Date: mexicoDate", mexicoDate);
  // console.warn("Definitive date:", date);
  // console.warn("Date: firstDay", firstDay);
  // console.warn("Date: lastDay", lastDay);
  // console.warn("Date: dates", dates);

  return (
    <div className="w-full">
      <div className="mt-4 flex justify-between gap-2 md:mt-8">
        <div className="justify-start">
          <h1 className="text-lg font-bold">{t("title")}</h1>
        </div>
        <div className="flex justify-end gap-2">
          <CreateTransaction isExpense={true} />
          <CreateTransaction isExpense={false} />
        </div>
      </div>
      <div className="block md:hidden">
        <div>
          <h2>{t("currentPeriod")}</h2>
        </div>
      </div>
      <div className="hidden flex md:block">
        <div className=" w-1/2 justify-start">
          <DatePicker placeholder="" locale={locale} />
        </div>
      </div>
      <div className="hidden w-full md:block">
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder={`${t("searchPlaceholder")}`} />
          {userTags.length > 0 && (
            <TagFilter
              availableTags={userTags}
              placeholder={t("tagFilterPlaceholder")}
              clearLabel={t("tagFilterClear")}
            />
          )}
          <div className="flex justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      </div>
      <div className="block w-full md:hidden">
        <Search placeholder={`${t("searchPlaceholder")}`} />
        {userTags.length > 0 && (
          <div className="mt-2">
            <TagFilter
              availableTags={userTags}
              placeholder={t("tagFilterPlaceholder")}
              clearLabel={t("tagFilterClear")}
            />
          </div>
        )}
      </div>

      <div className="hidden w-full md:block">
        <DashboardTable
          query={query}
          dates={dates}
          currentPage={currentPage}
          userId={session.user.id}
          tagIds={tagIds.length > 0 ? tagIds : undefined}
        />
      </div>
      <div className="block w-full md:hidden">
        <DashboardTableMobile
          query={query}
          dates={dates}
          currentPage={currentPage}
          userId={session.user.id}
          tagIds={tagIds.length > 0 ? tagIds : undefined}
        />
        <div className="flex flex-row p-2 justify-center items-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
