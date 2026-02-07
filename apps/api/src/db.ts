import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@glvt/db";

let dbInstance: NodePgDatabase<typeof schema> | null = null;
let pool: Pool | null = null;

function getDb(): NodePgDatabase<typeof schema> {
    if (!dbInstance) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL environment variable is not set");
        }
        pool = new Pool({ connectionString });
        dbInstance = drizzle(pool, { schema });
    }
    return dbInstance;
}

// Export a proxy that lazily initializes the db on first access
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
    get(target, prop) {
        const realDb = getDb();
        return (realDb as any)[prop];
    }
});
