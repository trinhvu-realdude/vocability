import { supabase } from "../configs/supabase";
import { Collection, CollectionShare, Profile, ShareRole } from "../interfaces/model";

// ─── Helpers ─────────────────────────────────────────────────────────────────

import { getActiveUserId } from "./AuthService";

// ─── User Search ──────────────────────────────────────────────────────────────

/**
 * Search profiles by partial username match.
 * Excludes the current user and returns at most 10 results.
 */
export const searchUsers = async (query: string, languageId?: number, userId?: string): Promise<Profile[]> => {
    if (!query.trim()) return [];

    const selfId = userId ?? await getActiveUserId();

    let queryBuilder = supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, collections!inner(language_id)")
        .ilike("username", `%${query}%`)
        .neq("id", selfId);

    if (languageId) {
        queryBuilder = queryBuilder.eq("collections.language_id", languageId);
    }

    const { data, error } = await queryBuilder.limit(20); // Fetch more to account for duplicates

    if (error) throw error;

    // Filter duplicates because of the inner join
    const uniqueProfilesMap = new Map<string, Profile>();
    (data ?? []).forEach((p: any) => {
        if (!uniqueProfilesMap.has(p.id)) {
            uniqueProfilesMap.set(p.id, {
                id: p.id,
                username: p.username,
                display_name: p.display_name,
                avatar_url: p.avatar_url,
                email: p.email || "" // Keep as empty if not fetched
            } as Profile);
        }
    });

    return Array.from(uniqueProfilesMap.values()).slice(0, 10);
};
// ─── Read Shares ──────────────────────────────────────────────────────────────

/**
 * Returns all share rows for a collection, joined with profile info.
 */
export const getSharesForCollection = async (
    collectionId: string
): Promise<CollectionShare[]> => {
    const { data, error } = await supabase
        .from("collection_shares")
        .select("*, profile:profiles(id, username, display_name, avatar_url)")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as CollectionShare[];
};

/**
 * Returns the effective role of the current user for a collection.
 * Returns 'owner' if the user owns the collection.
 * Returns the share role if the user has a share row.
 * Returns null if they have no access.
 */
export const getUserRole = async (
    collectionId: string,
    userId?: string
): Promise<ShareRole | 'owner' | null> => {
    const uid = userId ?? await getActiveUserId();

    // 1. Check ownership
    const { data: col } = await supabase
        .from("collections")
        .select("user_id")
        .eq("id", collectionId)
        .single();

    if (col?.user_id === uid) return 'owner';

    // 2. Check share row
    const { data: share } = await supabase
        .from("collection_shares")
        .select("role")
        .eq("collection_id", collectionId)
        .eq("user_id", uid)
        .maybeSingle();

    if (share) return share.role as ShareRole;
    return null;
};

// ─── Write Shares ─────────────────────────────────────────────────────────────

/**
 * Insert or update a share row.
 * If role === 'owner':
 *   - Demotes current collection owner to 'editor' in collection_shares
 *   - Updates the collections.user_id to the new owner
 */
export const upsertShare = async (
    collectionId: string,
    userId: string,
    role: ShareRole,
    currentUserId?: string
): Promise<void> => {
    if (role === 'owner') {
        const currentOwnerId = currentUserId ?? await getActiveUserId();

        // Demote current owner to editor in shares table (upsert)
        const { error: demoteError } = await supabase
            .from("collection_shares")
            .upsert(
                { collection_id: collectionId, user_id: currentOwnerId, role: 'editor' },
                { onConflict: "collection_id,user_id" }
            );
        if (demoteError) throw demoteError;

        // Transfer ownership in collections table
        const { error: transferError } = await supabase
            .from("collections")
            .update({ user_id: userId })
            .eq("id", collectionId);
        if (transferError) throw transferError;

        // Remove new owner's old share row (they're now the owner)
        await supabase
            .from("collection_shares")
            .delete()
            .eq("collection_id", collectionId)
            .eq("user_id", userId);

        return;
    }

    // Normal upsert for viewer/editor
    const { error } = await supabase
        .from("collection_shares")
        .upsert(
            { collection_id: collectionId, user_id: userId, role, updated_at: new Date().toISOString() },
            { onConflict: "collection_id,user_id" }
        );
    if (error) throw error;
};

/**
 * Remove a user's access to a collection.
 */
export const removeShare = async (
    collectionId: string,
    userId: string
): Promise<void> => {
    const { error } = await supabase
        .from("collection_shares")
        .delete()
        .eq("collection_id", collectionId)
        .eq("user_id", userId);
    if (error) throw error;
};

// ─── Shared Collections ───────────────────────────────────────────────────────

/**
 * Returns collections shared with the current user (not owned by them).
 * Includes shares joined on each collection.
 */
export const getSharedCollections = async (languageId?: number, userId?: string): Promise<Collection[]> => {
    const uid = userId ?? await getActiveUserId();

    // Get share rows for this user
    const { data: shareRows, error: shareError } = await supabase
        .from("collection_shares")
        .select("collection_id, role")
        .eq("user_id", uid);

    if (shareError) throw shareError;
    if (!shareRows || shareRows.length === 0) return [];

    const collectionIds = shareRows.map((s: any) => s.collection_id);
    const roleMap: Record<string, ShareRole> = {};
    shareRows.forEach((s: any) => { roleMap[s.collection_id] = s.role; });

    // Fetch the collections themselves
    let query = supabase
        .from("collections")
        .select("*, words(count)")
        .in("id", collectionIds)
        .order("created_at", { ascending: false });

    if (languageId) {
        query = query.eq("language_id", languageId);
    }

    const { data: collections, error: colError } = await query;

    if (colError) throw colError;

    return (collections ?? []).map((c: any) => ({
        ...c,
        num_of_words: c.words?.[0]?.count ?? 0,
        myRole: roleMap[c.id] ?? 'viewer',
    })) as Collection[];
};
