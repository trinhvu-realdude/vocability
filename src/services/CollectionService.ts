import { supabase } from "../configs/supabase";
import { Collection } from "../interfaces/model";
import { languages } from "../utils/constants";

// ─── Helpers ────────────────────────────────────────────────────────────────

import { getActiveUserId } from "./AuthService";

// ─── Read ────────────────────────────────────────────────────────────────────

export const getCollections = async (userId?: string): Promise<Collection[]> => {
    const uid = userId ?? await getActiveUserId();
    const { data, error } = await supabase
        .from("collections")
        .select("*, words(count)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((c: any) => ({
        ...c,
        numOfWords: c.words?.[0]?.count ?? 0,
    }));
};

export const getCollectionsByLanguageId = async (
    languageId: number,
    userId?: string
): Promise<Collection[]> => {
    const uid = userId ?? await getActiveUserId();
    const { data, error } = await supabase
        .from("collections")
        .select("*, words(count)")
        .eq("language_id", languageId)
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map((c: any) => ({
        ...c,
        numOfWords: c.words?.[0]?.count ?? 0,
    }));
};

export const getCollectionById = async (
    id: string
): Promise<Collection | undefined> => {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return undefined;
    return data;
};

export const getCollectionByNameAndLanguageId = async (
    name: string,
    languageId: number
): Promise<Collection | undefined> => {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("name", name)
        .eq("language_id", languageId)
        .maybeSingle();

    if (error) return undefined;
    return data ?? undefined;
};

export const getActiveLanguages = async (userId?: string) => {
    const collections = await getCollections(userId);
    const activeLanguageIds = new Set(collections.map((c) => c.language_id));
    return languages.filter((lang) => activeLanguageIds.has(lang.id));
};

export const getColorByCollectionId = async (
    collectionId: string
): Promise<string> => {
    const collection = await getCollectionById(collectionId);
    return collection?.color ?? "";
};

// ─── Write ───────────────────────────────────────────────────────────────────

export const addCollection = async (
    collection: Omit<Collection, "id" | "user_id" | "created_at" | "updated_at">,
    userId?: string
): Promise<string> => {
    const uid = userId ?? await getActiveUserId();

    const { data, error } = await supabase
        .from("collections")
        .insert({ ...collection, user_id: uid })
        .select("id")
        .single();

    if (error) throw error;
    return data.id;
};

export const updateCollection = async (
    collection: Collection,
    renameValue: string,
    color: string
): Promise<Collection> => {
    const { data, error } = await supabase
        .from("collections")
        .update({ name: renameValue, color })
        .eq("id", collection.id!)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteCollection = async (collection: Collection): Promise<void> => {
    // Words and definitions are cascade-deleted by the DB foreign key
    const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", collection.id!);

    if (error) throw error;
};
