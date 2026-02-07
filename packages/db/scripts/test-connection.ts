import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log("Connection String found:", !!connectionString);
console.log("Masked Connection String:", connectionString ? connectionString.replace(/:[^:]*@/, ':****@') : "None");

if (!connectionString) {
    console.error("No DATABASE_URL found");
    process.exit(1);
}

const sql = postgres(connectionString);

async function testConnection() {
    try {
        console.log("Attempting to connect...");
        const result = await sql`SELECT 1 as res`;
        console.log("Connection successful!", result);
    } catch (error) {
        console.error("Connection failed:", error);
    } finally {
        await sql.end();
    }
}

testConnection();
