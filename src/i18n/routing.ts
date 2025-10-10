import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "es"],

  // Used when no locale matches
  defaultLocale: "en",

  pathnames: {
    "/": { en: "/", es: "/" },
    "/dashboard": { en: "/dashboard", es: "/dashboard" },
    "/dashboard/budget": {
      en: "/dashboard/budget",
      es: "/dashboard/presupuesto",
    },
    "/dashboard/history": {
      en: "/dashboard/history",
      es: "/dashboard/historial",
    },
    "/dashboard/profile": { en: "/dashboard/profile", es: "/dashboard/perfil" },
    "/dashboard/transactions": {
      en: "/dashboard/transactions",
      es: "/dashboard/transacciones",
    },
    "/dashboard/transactions/create": {
      en: "/dashboard/transactions/create",
      es: "/dashboard/transacciones/crear",
    },
    "/dashboard/transactions/[id]/edit": {
      en: "/dashboard/transactions/[id]/edit",
      es: "/dashboard/transacciones/[id]/editar",
    },
  },
});
