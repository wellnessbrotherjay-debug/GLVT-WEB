import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: 'postgres://schedule:schedule@127.0.0.1:5433/schedule'
    });
    await client.connect();

    const tables = ['sch_bookings', 'sch_staff_shifts', 'sch_rooms'];
    for (const table of tables) {
        console.log(`--- Table: ${table} ---`);
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '${table}';
        `);
        console.table(res.rows);
    }

    await client.end();
}

main().catch(console.error);
