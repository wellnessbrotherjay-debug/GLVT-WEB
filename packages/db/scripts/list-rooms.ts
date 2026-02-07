import { db } from "../apps/api/src/db";
import { resources } from "./src/schema/booking";

async function listRooms() {
    const rooms = await db.select().from(resources);
    console.log(JSON.stringify(rooms, null, 2));
}

listRooms().catch(console.error);
