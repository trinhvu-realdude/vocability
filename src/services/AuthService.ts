import { supabase } from "../configs/supabase";
import type { User } from "@supabase/supabase-js";

// ─── Session Cache ────────────────────────────────────────────────────────────
// Cache the User object so that all services within a single page-load can call
// getActiveUser() / getActiveUserId() without triggering a round-trip to
// /auth/v1/user each time.

let cachedUser: User | null = null;

// Invalidate the cache whenever auth state changes (sign-in, sign-out, refresh)
supabase.auth.onAuthStateChange((_event, session) => {
    cachedUser = session?.user ?? null;
});

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
    cachedUser = null;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Get current authenticated user object.
 * Returns immediately from cache when available; falls back to a network call
 * only on the first invocation per session.
 */
export const getActiveUser = async (): Promise<User> => {
    if (cachedUser) return cachedUser;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    cachedUser = user;
    return user;
};

/**
 * Get current authenticated user ID (cached)
 */
export const getActiveUserId = async (): Promise<string> => {
    const user = await getActiveUser();
    return user.id;
};

