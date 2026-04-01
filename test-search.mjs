import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearchAll() {
    try {
        let queryBuilder = supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url");

        const { data, error } = await queryBuilder.limit(20);
        console.log("Data:", data);
        console.log("Error:", error);
    } catch (err) {
        console.error("Catch:", err);
    }
}

testSearchAll();
