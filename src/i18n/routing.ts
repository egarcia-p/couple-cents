import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en-US", "es-MX"],

  // Used when no locale matches
  defaultLocale: "en-US",

  pathnames: {
    "/": { "en-US": "/", es: "/" },
    "/dashboard": { "en-US": "/dashboard", es: "/dashboard" },
    "/dashboard/budget": {
      "en-US": "/dashboard/budget",
      es: "/dashboard/presupuesto",
    },
    "/dashboard/history": {
      "en-US": "/dashboard/history",
      es: "/dashboard/historial",
    },
    "/dashboard/profile": {
      "en-US": "/dashboard/profile",
      es: "/dashboard/perfil",
    },
    "/dashboard/transactions": {
      "en-US": "/dashboard/transactions",
      es: "/dashboard/transacciones",
    },
    "/dashboard/transactions/create": {
      "en-US": "/dashboard/transactions/create",
      es: "/dashboard/transacciones/crear",
    },
    "/dashboard/transactions/[id]/edit": {
      "en-US": "/dashboard/transactions/[id]/edit",
      es: "/dashboard/transacciones/[id]/editar",
    },
  },
});
