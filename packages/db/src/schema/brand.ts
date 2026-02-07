import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// === WORKOUTS (New) ===
export const exercises = pgTable("brand_exercises", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    videoUrl: text("video_url"),

    category: text("category"),
    difficulty: text("difficulty"), // 'beginner', 'intermediate', 'advanced'
});

export const workouts = pgTable("brand_workouts", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),

    durationMinutes: integer("duration_minutes"),
    caloriesBurn: integer("calories_burn"),

    imageUrl: text("image_url"),

    // Format details (blocks, rounds etc.) stored as JSON for flexibility
    structure: jsonb("structure"), // { blocks: [...] }
});

export const workoutExercises = pgTable("brand_workout_exercises", {
    id: serial("id").primaryKey(),
    workoutId: integer("workout_id").references(() => workouts.id),
    exerciseId: integer("exercise_id").references(() => exercises.id),

    order: integer("order").notNull(),
    sets: integer("sets"),
    reps: text("reps"),
    durationSeconds: integer("duration_seconds"),
});

// === CONTENT (Maps to sch_mp_banners) ===
export const banners = pgTable("sch_mp_banners", {
    id: serial().primaryKey().notNull(),
    title: text(),
    imageUrl: text("image_url"),
    linkUrl: text("link_url"),
    current: boolean().default(true).notNull(),
    position: integer().default(0).notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),

    // My new columns
    isActive: boolean("is_active").default(true),
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),
});
