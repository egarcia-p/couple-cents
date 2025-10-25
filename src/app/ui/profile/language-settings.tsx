import { Button } from "../button";
import { useTranslations } from "next-intl";
import { user, userSettings } from "../../../../drizzle/schema";
import locales from "@/i18n/locales.json";
import timezones from "@/i18n/timezones.json";

import { useFormState } from "react-dom";
import { saveLanguageSettings } from "@/app/lib/actions";
import { useState } from "react";
import { UserSettings } from "@/app/lib/definitions";

interface LanguageSettingsProps {
  userId: string;
  userSettings: UserSettings;
}

export default function LanguageSettings({
  userId,
  userSettings,
}: LanguageSettingsProps) {
  const t = useTranslations("Profile");
  const [region, setRegion] = useState("America");

  const defaultTimezone = userSettings.timezone
    ? userSettings.timezone
    : Intl.DateTimeFormat().resolvedOptions().timeZone;

  const initialState = { message: "", errors: {} };
  const [state, dispatch] = useFormState(saveLanguageSettings, initialState);

  return (
    <div className="rounded-lg bg-gray-50 p-2 ">
      <div className="ml-4 m-4 flex flex-col gap-4">
        <h1 className="text-xl font-bold">{t("settings.title")}</h1>
        <form action={dispatch}>
          <input type="hidden" name="userId" value={userId} />
          <div className="flex flex-col gap-2">
            {/* Language Setting */}
            <div className="mb-4">
              <label
                htmlFor="language"
                className="mb-2 block text-sm font-medium"
              >
                {t("settings.language")}
              </label>
              <div className="relative mt-2 rounded-md">
                <div className="relative">
                  <select
                    id="language"
                    name="language"
                    className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                    defaultValue={userSettings.language}
                    aria-describedby="language-error"
                  >
                    <option value="" disabled>
                      {t("settings.languagePlaceholder")}
                    </option>
                    {locales.map((locale) => (
                      <option key={locale.key} value={locale.key}>
                        {locale.label}
                      </option>
                    ))}
                  </select>
                  {/* <  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" /> */}
                </div>
                <div id="language-error" aria-live="polite" aria-atomic="true">
                  {state.errors?.language &&
                    state.errors.language.map((error: string) => (
                      <p className="mt-2 text-sm text-red-500" key={error}>
                        {error}
                      </p>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex">
              <span className="text-gray-700">{t("settings.timezone")}</span>
            </div>
            <div className="flex gap-4">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                {Object.keys(timezones).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                //value={timezone}
                name="timezone"
                //={(e) => setTimezone(e.target.value)}
                defaultValue={userSettings.timezone}
              >
                {timezones[region].map((tz) => (
                  <option key={tz.key} value={tz.key}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div id="timezone-error" aria-live="polite" aria-atomic="true">
              {state.errors?.timezone &&
                state.errors.timezone.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
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
