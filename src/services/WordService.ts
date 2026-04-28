import { supabase } from "../configs/supabase";
import { Collection, Word, WordDto, Definition } from "../interfaces/model";
import {
    addCollection,
    getCollectionByNameAndLanguageId,
} from "./CollectionService";
import { EditWordObj, ExternalWord, VerbConjugation } from "../interfaces/mainProps";
import { getCurrentLanguageId } from "../utils/helper";
import { languages } from "../utils/constants";

// ─── Helpers ────────────────────────────────────────────────────────────────

import { getActiveUserId } from "./AuthService";

/** Fetch definitions for a list of word ids and attach them */
export const attachDefinitions = async (words: Word[]): Promise<Word[]> => {
    if (words.length === 0) return [];
    const ids = words.map((w) => w.id!);
    const { data: defs, error } = await supabase
        .from("definitions")
        .select("*")
        .in("word_id", ids)
        .order("sort_order", { ascending: true });

    if (error) throw error;

    return words.map((w) => ({
        ...w,
        definitions: (defs ?? [])
            .filter((d: any) => d.word_id === w.id)
            .map((d: any) => ({ id: d.id, word_id: d.word_id, definition: d.definition, notes: d.notes ?? "", sort_order: d.sort_order })),
    }));
};

// ─── Read ────────────────────────────────────────────────────────────────────

export const getWords = async (userId?: string): Promise<Word[]> => {
    const uid = userId ?? await getActiveUserId();
    const { data, error } = await supabase
        .from("words")
        .select("*, definitions(*)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .order("sort_order", { foreignTable: "definitions", ascending: true });
    if (error) throw error;
    return data ?? [];
};

export const getWordById = async (wordId: string): Promise<Word | undefined> => {
    const { data, error } = await supabase
        .from("words")
        .select("*, definitions(*)")
        .eq("id", wordId)
        .order("sort_order", { foreignTable: "definitions", ascending: true })
        .single();
    if (error) return undefined;
    return data;
};

export const getWordsByCollectionId = async (
    collectionId: string
): Promise<Word[]> => {
    const { data, error } = await supabase
        .from("words")
        .select("*, definitions(*)")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false })
        .order("sort_order", { foreignTable: "definitions", ascending: true });
    if (error) throw error;
    return data ?? [];
};

export const getWordsByCollectionIdPaginated = async (
    collectionId: string,
    from: number,
    to: number
): Promise<Word[]> => {
    const { data, error } = await supabase
        .from("words")
        .select("*, definitions(*)")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false })
        .order("sort_order", { foreignTable: "definitions", ascending: true })
        .range(from, to);
    if (error) throw error;
    return data ?? [];
};

export const getFavoriteWords = async (
    currentLanguageId: number,
    userId?: string
): Promise<WordDto[]> => {
    const uid = userId ?? await getActiveUserId();
    const { data, error } = await supabase
        .from("words")
        .select("*, collections!inner(*), definitions(*)")
        .eq("is_favorite", true)
        .eq("user_id", uid)
        .eq("collections.language_id", currentLanguageId)
        .order("created_at", { ascending: false })
        .order("sort_order", { foreignTable: "definitions", ascending: true });
    if (error) throw error;

    return (data ?? []).map((w: any) => ({
        ...w,
        collection: w.collections as Collection,
    }));
};

export const getWordsByLanguageCode = async (
    languageCode: string
): Promise<Word[]> => {
    const currentLanguageId = await getCurrentLanguageId(languages, languageCode);

    const { data, error } = await supabase
        .from("words")
        .select("*, collections!inner(*), definitions(*)")
        .eq("collections.language_id", currentLanguageId)
        .order("sort_order", { foreignTable: "definitions", ascending: true });

    if (error) throw error;
    return data ?? [];
};

// ─── Write ───────────────────────────────────────────────────────────────────

const upsertDefinitions = async (
    wordId: string,
    definitions: Definition[]
): Promise<void> => {
    // Delete old definitions then insert fresh ones
    await supabase.from("definitions").delete().eq("word_id", wordId);
    if (definitions.length === 0) return;
    const rows = definitions.map((d, i) => ({
        word_id: wordId,
        definition: d.definition,
        notes: d.notes ?? "",
        sort_order: i,
    }));
    const { error } = await supabase.from("definitions").insert(rows);
    if (error) throw error;
};

export const addWord = async (
    objWord: Word,
    objCollection: Collection,
    currentLanguageId: number,
    userId?: string
): Promise<Word> => {
    const uid = userId ?? await getActiveUserId();

    // Resolve or create collection
    let collectionId: string;
    const existing = await getCollectionByNameAndLanguageId(
        objCollection.name,
        currentLanguageId
    );
    if (!existing) {
        collectionId = await addCollection({
            name: objCollection.name,
            color: objCollection.color,
            language_id: currentLanguageId,
        }, uid);
    } else {
        collectionId = existing.id!;
    }

    const { definitions, ...wordFields } = objWord;
    const { data, error } = await supabase
        .from("words")
        .insert({
            ...wordFields,
            user_id: uid,
            collection_id: collectionId,
        })
        .select("*")
        .single();
    if (error) throw error;

    await upsertDefinitions(data.id, definitions);
    return { ...data, definitions };
};

export const updateWord = async (
    word: Word,
    editValue: EditWordObj
): Promise<Word> => {
    const { data, error } = await supabase
        .from("words")
        .update({
            word: editValue.word,
            phonetic: editValue.phonetic,
            part_of_speech: editValue.partOfSpeech,
        })
        .eq("id", word.id!)
        .select("*")
        .single();
    if (error) throw error;

    await upsertDefinitions(word.id!, editValue.definitions);
    return { ...data, definitions: editValue.definitions };
};

export const moveWordToCollection = async (
    wordId: string,
    toCollectionId: string
): Promise<void> => {
    const { error } = await supabase
        .from("words")
        .update({ collection_id: toCollectionId })
        .eq("id", wordId);
    if (error) throw error;
};

export const deleteWord = async (word: Word): Promise<void> => {
    // Definitions are cascade-deleted by DB FK
    const { error } = await supabase
        .from("words")
        .delete()
        .eq("id", word.id!);
    if (error) throw error;
};

export const deleteWordsByCollectionId = async (
    collectionId: string
): Promise<void> => {
    // Handled by CASCADE, but we expose this for explicit calls
    const { error } = await supabase
        .from("words")
        .delete()
        .eq("collection_id", collectionId);
    if (error) throw error;
};

export const addWordToFavorite = async (
    word: Word,
    isFavorite: boolean
): Promise<void> => {
    const { error } = await supabase
        .from("words")
        .update({ is_favorite: isFavorite })
        .eq("id", word.id!);
    if (error) throw error;
};

// ─── External API ────────────────────────────────────────────────────────────

export const getPhonetic = async (
    word: string
): Promise<string | undefined> => {
    const fetchPhonetic = async (w: string) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_DICTIONARY_URL}${w.replace(/\//g, "")}`
            );
            const data = await response.json();
            if (data instanceof Array) {
                for (const element of data[0].phonetics) {
                    if (element.text) return element.text as string;
                }
            }
            return undefined;
        } catch (error) {
            return undefined;
        }
    };

    const phonetic = await fetchPhonetic(word);
    if (!phonetic) {
        let result = "";
        for (const w of word.split(" ")) {
            const data = await fetchPhonetic(w);
            if (data) result += data + " ";
            else return undefined;
        }
        return "/" + result.replace(/\//g, "").trim() + "/";
    }
    return phonetic;
};

export const getSynonymsAntonyms = async (
    word: Word
): Promise<{ synonyms: string[]; antonyms: string[] } | undefined> => {
    try {
        const response = await fetch(
            `${import.meta.env.VITE_API_DICTIONARY_URL}${word.word}`
        );
        const data = await response.json();
        const meanings = data[0].meanings as Array<any>;
        for (const meaning of meanings) {
            if (meaning.partOfSpeech === word.part_of_speech) {
                return { synonyms: meaning.synonyms, antonyms: meaning.antonyms };
            }
        }
    } catch (error) {
        console.log(error);
    }
    return undefined;
};

export const getExternalWord = async (
    word: string
): Promise<ExternalWord[] | { message: string }> => {
    const response = await fetch(
        `${import.meta.env.VITE_API_DICTIONARY_URL}${word}`
    );
    const data = await response.json();
    return data as ExternalWord[];
};

export const getVerbConjugation = async (
    languageCode: string,
    word: Word
): Promise<VerbConjugation | undefined> => {
    if (languageCode && (word.part_of_speech == "verb" || word.part_of_speech == "")) {
        const response = await fetch(
            `${import.meta.env.VITE_API_VERB_CONJUGATION_URL}?l=${languageCode}&q=${word.word}`
        );
        const data = await response.json();
        return data as VerbConjugation;
    }
    return undefined;
};
