# Steps to deploy a big change with migrations

First create a maintenance config in next.config.js

```js
return {
  beforeFiles: [
    {
      source: "/:path((?!maintenance\\.html|_next|static).*)",
      destination: "/maintenance.html",
    },
  ],
};
```

Note: assuming the mantainance page is in public/maintenance.html

Then create a branch for the bug fix, and push the code to that branch. Then merge to main and deploy to production. The maintenance page will be active during the deployment, and once the deployment is complete, the maintenance page will be removed automatically.

## Merge the branch for Deployment

Then deploy the big change with migration branch to production. The build commands should include the migrations.

if you have to run a one off script to modify exisitng data like for example encrypting existing data, you can create a script and refernece it in the package.json scripts section, and then run it in the build command before the next build command. For example:

Using vercel cli:
`vercel pull --environment=production`

Make sure the POSTGRES_URL env is set to run one of scripts.

Execute db migrations or scripts examples

`npx dotenv -e .vercel/.env.production.local -- npx drizzle-kit up` to apply pending migrations

`npx dotenv -e .vercel/.env.production.local -- npx drizzle-kit migrate` to generate and apply new migrations

`npx dotenv -e .vercel/.env.production.local -- npm run db:encrypt`

# Post-Deployment

After confirming all steps were correctly executed, you can remove the maintenance mode configuration from next.config.js and deploy again to remove the maintenance page.

# Testing

Make sure to test the production environment after deployment to confirm everything is working as expected.

# Rollback Plan

In case of any issues, you can quickly rollback to the previous stable version by reverting the merge commit.

For the database, if you have a backup before the migration, you can restore it to revert any changes made by the migration. Always ensure you have a backup before running migrations on production data.
