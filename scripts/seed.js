const { db } = require("@vercel/postgres");
// const {
//   invoices,
//   customers,
//   revenue,
//   users,
// } = require("../app/lib/placeholder-data.js");

async function seedUsers(client) {
  try {
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL,
        name VARCHAR(255),
        email VARCHAR(255),
        "emailVerified" TIMESTAMPTZ,
        image TEXT,
        
        PRIMARY KEY (id)
      );
    `;

    console.log(`Created "users" table`);

    // Insert data into the "users" table
    console.log(`Seeded users`);

    return {
      createTable,
    };
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

async function seedSessions(client) {
  try {
    // Create the "sessions" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL,
        "userId" INTEGER NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        "sessionToken" VARCHAR(255) NOT NULL,
        
        PRIMARY KEY (id)
      );
    `;

    console.log(`Created "sessions" table`);

    // Insert data into the "sessions" table
    console.log(`Seeded sessions`);

    return {
      createTable,
    };
  } catch (error) {
    console.error("Error seeding sessions:", error);
    throw error;
  }
}

async function seedAccounts(client) {
  try {
    // Create the "accounts" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL,
        "userId" INTEGER NOT NULL,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        "providerAccountId" VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        id_token TEXT,
        scope TEXT,
        session_state TEXT,
        token_type TEXT,
        
        PRIMARY KEY (id)
      );
    `;

    console.log(`Created "accounts" table`);

    // Insert data into the "accounts" table
    console.log(`Seeded accounts`);

    return {
      createTable,
    };
  } catch (error) {
    console.error("Error seeding accounts:", error);
    throw error;
  }
}

async function seedVerificationToken(client) {
  try {
    // Create the "verification_token" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS verification_token (
        identifier TEXT NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        token TEXT NOT NULL,
        
        PRIMARY KEY (identifier, token)
      );
    `;

    console.log(`Created "verification_token" table`);

    // Insert data into the "verification_token" table
    console.log(`Seeded verification_token`);

    return {
      createTable,
    };
  } catch (error) {
    console.error("Error seeding verification_token:", error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await seedUsers(client);
  await seedSessions(client);
  await seedAccounts(client);
  await seedVerificationToken(client);

  await client.end();
}

main().catch((err) => {
  console.error(
    "An error occurred while attempting to seed the database:",
    err,
  );
});
