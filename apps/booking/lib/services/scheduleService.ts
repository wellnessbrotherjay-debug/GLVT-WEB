import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

export type ScheduleItem = Database['public']['Tables']['user_schedule']['Row'];

export const scheduleService = {

    async getScheduleForDate(userId: string, date: string) {
        // 1. Fetch generic schedule items (workouts, meals)
        const { data: scheduleItems, error: scheduleError } = await supabase
            .from('user_schedule')
            .select('*')
            .eq('user_id', userId)
            .eq('scheduled_date', date);

        if (scheduleError) throw scheduleError;

        // 2. Fetch class bookings for this date
        // Note: We need to filter by the date part of scheduled_time
        // This requires a range query for the whole day
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59`;

        const { data: classBookings, error: bookingError } = await supabase
            .from('class_bookings')
            .select(`
                id,
                booking_status,
                class_schedule:class_schedules!inner(
                    id,
                    scheduled_time,
                    studio_class:studio_classes(name)
                )
            `)
            .eq('user_id', userId)
            .eq('booking_status', 'confirmed')
            .gte('class_schedule.scheduled_time', startOfDay)
            .lte('class_schedule.scheduled_time', endOfDay);

        if (bookingError) console.error("Error fetching class bookings for diary:", bookingError);

        // 3. Transform class bookings to ScheduleItem format
        const classItems = (classBookings || []).map((booking: any) => ({
            id: booking.id,
            user_id: userId,
            scheduled_date: date,
            item_type: 'class',
            reference_id: booking.class_schedule.id,
            status: booking.booking_status,
            // Custom fields for UI helper
            title: booking.class_schedule.studio_class?.name || 'Studio Class',
            start_time: booking.class_schedule.scheduled_time
        }));

        // 4. Enrich generic items with titles
        const enrichedScheduleItems = await Promise.all((scheduleItems || []).map(async (item: any) => {
            if (item.item_type === 'workout') {
                const { data: workout } = await (supabase
                    .from('workouts') as any)
                    .select('title')
                    .eq('id', item.reference_id)
                    .single();
                return { ...item, title: workout?.title || 'Workout' };
            }
            return { ...item, title: item.item_type === 'meal' ? 'Meal' : 'Activity' };
        }));

        // 5. Merge and return
        return [...enrichedScheduleItems, ...classItems];
    },

    async addToSchedule(userId: string, date: string, itemType: 'workout' | 'class', referenceId: string) {
        const { data, error } = await (supabase
            .from('user_schedule') as any)
            .insert({
                user_id: userId,
                scheduled_date: date,
                item_type: itemType,
                reference_id: referenceId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async markComplete(scheduleId: string) {
        const { error } = await (supabase
            .from('user_schedule') as any)
            .update({ status: 'completed' })
            .eq('id', scheduleId);

        if (error) throw error;
    },

    async getUpcoming(userId: string) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('user_schedule')
            .select('*')
            .eq('user_id', userId)
            .gte('scheduled_date', today)
            .order('scheduled_date', { ascending: true })
            .limit(5);

        if (error) throw error;
        return data;
    }
};
