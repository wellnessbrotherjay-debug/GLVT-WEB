import { db } from "../../db";
import { workouts, exercises, banners } from "@glvt/db";
import { eq, desc } from "drizzle-orm";

export class BrandService {
    async getWorkouts() {
        return await db.query.workouts.findMany({
            with: {
                exercises: true
            }
        });
    }

    async getWorkoutById(id: number) {
        return await db.query.workouts.findFirst({
            where: eq(workouts.id, id),
            with: {
                exercises: true,
            }
        });
    }

    async getBanners() {
        return await db.query.banners.findMany({
            orderBy: desc(banners.position),
            where: eq(banners.isActive, true),
        });
    }
}

export const brandService = new BrandService();
