import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

const connectionString = "postgres://schedule:schedule@localhost:5433/schedule";
console.log("Testing localhost connection:", connectionString);

const pool = new Pool({
    connectionString,
    // ssh: { rejectUnauthorized: false } // No SSL for local
});

async function testConnection() {
    try {
        console.log("Attempting to connect with pg...");
        const client = await pool.connect();
        console.log("Connected!");
        const res = await client.query('SELECT NOW()');
        console.log("Time:", res.rows[0]);
        client.release();
        await pool.end();
        console.log("Pool ended.");
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
}

testConnection();
