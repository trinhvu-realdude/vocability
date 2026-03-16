import { supabase } from "../configs/supabase";
import { Profile } from "../interfaces/model";
import { getCollections, getActiveLanguages } from "./CollectionService";
import { getWords } from "./WordService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getActiveUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return user;
};

// ─── Read ────────────────────────────────────────────────────────────────────

export const getProfile = async (): Promise<Profile> => {
    const user = await getActiveUser();

    // Check if profile exists
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found error if maybeSingle isn't used correctly, but maybeSingle returns null/undefined if not found without throwing error.

    if (data) {
        return data as Profile;
    }

    // If no profile, create one with default metadata
    const newProfile: Profile = {
        id: user.id,
        email: user.email || "",
        username: user.email?.split("@")[0] || "user",
        display_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        avatar_url: user.user_metadata?.avatar_url || "",
    };

    const { data: insertedData, error: insertError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

    if (insertError) {
        console.error("Error creating profile, returning mock profile", insertError);
        return newProfile;
    }
    return insertedData as Profile;
};

export const getProfileStats = async () => {
    try {
        const collections = await getCollections();
        const activeLanguages = await getActiveLanguages();
        const words = await getWords(); // Or calculate from collections numOfWords
        
        let totalWords = 0;
        collections.forEach(c => {
            totalWords += (c.num_of_words || (c as any).numOfWords || 0); // Handle mapped numOfWords
        });
        
        // If the collection mapping doesn't have it accurately, just use word length
        if (totalWords === 0 && words.length > 0) {
            totalWords = words.length;
        }

        return {
            languagesLearning: activeLanguages.length,
            numberOfCollections: collections.length,
            numberOfWords: totalWords,
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            languagesLearning: 0,
            numberOfCollections: 0,
            numberOfWords: 0,
        };
    }
};

// ─── Write ───────────────────────────────────────────────────────────────────

export const updateProfile = async (
    updates: Partial<Omit<Profile, "id" | "email" | "created_at" | "updated_at">>
): Promise<Profile> => {
    const user = await getActiveUser();

    const { data, error } = await supabase
        .from("profiles")
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
};

export const deleteAccount = async (): Promise<void> => {
    const user = await getActiveUser();
    // Assuming backend handles cascade deletes and auth deletion via RPC
    const { error } = await supabase.rpc('delete_user');
    
    // If RPC is unavailable or fails, we might just delete from profiles if auth delete isn't possible directly from client
    if (error) {
         console.warn("RPC delete_user failed, trying simple delete", error);
         // Client side auth deletion requires admin token usually, but users can sometimes delete themselves if RLS allows.
         // Often we just delete the profile and cascade does the rest, or sign out.
         const res = await supabase.from('profiles').delete().eq('id', user.id);
         if (res.error) throw res.error;
    }
    
    // Sign out
    await supabase.auth.signOut();
};
