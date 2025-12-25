
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseKey) {
            return new Response(JSON.stringify({ error: 'Missing environment variables' }), { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        const payload = await req.json()
        const { record } = payload

        if (!record || !record.id) {
            return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 })
        }

        console.log(`Processing signup for user: ${record.id}`)

        // Insert into gym_profiles
        const { error } = await supabase
            .from('gym_profiles')
            .insert({
                id: record.id,
                first_name: record.raw_user_meta_data?.full_name?.split(' ')[0] || 'Member',
                last_name: record.raw_user_meta_data?.full_name?.split(' ').slice(1).join(' ') || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (error) {
            // Ignore conflict errors (idempotency)
            if (error.code === '23505') {
                console.log('Profile already exists')
                return new Response(JSON.stringify({ message: 'Profile already exists' }), { status: 200 })
            }
            throw error
        }

        return new Response(JSON.stringify({ message: 'Profile created successfully' }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        })

    } catch (error) {
        console.error('Error processing signup:', error.message)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        })
    }
})
