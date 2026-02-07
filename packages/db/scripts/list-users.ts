
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../src/schema/core";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
    connectionString: "postgres://schedule:schedule@127.0.0.1:5433/schedule",
});

async function main() {
    await client.connect();
    const db = drizzle(client, { schema });

    const users = await db.select().from(schema.users);
    console.log("Found users:", users);

    await client.end();
}

main();
