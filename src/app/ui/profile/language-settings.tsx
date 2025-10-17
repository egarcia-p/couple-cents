import { Button } from "../button";
import { useTranslations } from "next-intl";
import { user } from "../../../../drizzle/schema";

interface LanguageSettingsProps {
  userId: string;
  dispatch: (payload: FormData) => void;
}

export default function LanguageSettings({
  userId,
  dispatch,
}: LanguageSettingsProps) {
  const t = useTranslations("Profile");
  return (
    <div className="rounded-lg bg-gray-50 p-2 ">
      <div className="ml-4 m-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold">{t("settings.title")}</h1>
        <form action={dispatch}>
          <input type="hidden" name="userId" value={userId} />
          <div className="flex flex-col gap-2">
            <div className="flex">
              <span className="text-gray-700">{t("settings.language")}</span>
            </div>
            <div className="flex w-full">
              <input
                type="text"
                name="language"
                placeholder={t("settings.languagePlaceholder")}
              />
            </div>
            <div className="flex">
              <span className="text-gray-700">{t("settings.timezone")}</span>
            </div>
            <div className="flex w-full">
              <input
                type="text"
                name="timezone"
                placeholder={t("settings.timezonePlaceholder")}
              />
            </div>
            <div className="flex w-full justify-left">
              <Button type="submit">{t("settings.saveButton")}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
