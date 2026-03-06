import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: "/:path((?!maintenance\\.html|_next|static).*)",
          destination: "/maintenance.html",
        },
      ],
    };
  },
};
export default withNextIntl(nextConfig);
