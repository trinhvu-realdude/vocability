import { supabase } from "../configs/supabase";

/**
 * Sign in with email using OTP (magic link sent to email)
 */
export const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin,
        },
    });
    console.log(error);

    if (error) throw error;
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
