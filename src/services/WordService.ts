import { supabase } from "../configs/supabase";
import { Collection, Word, WordDto, Definition } from "../interfaces/model";
import {
    addCollection,
    getCollectionByNameAndLanguageId,
    getCollectionsByLanguageId,
} from "./CollectionService";
import { EditWordObj, ExternalWord } from "../interfaces/mainProps";
import { getCurrentLanguageId } from "../utils/helper";
import { languages } from "../utils/constants";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getActiveUserId = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return user.id;
};

/** Fetch definitions for a list of word ids and attach them */
const attachDefinitions = async (words: Word[]): Promise<Word[]> => {
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

export const getWords = async (): Promise<Word[]> => {
    const { data, error } = await supabase
        .from("words")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return attachDefinitions(data ?? []);
};

export const getWordById = async (wordId: string): Promise<Word | undefined> => {
    const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("id", wordId)
        .single();
    if (error) return undefined;
    const [withDefs] = await attachDefinitions([data]);
    return withDefs;
};

export const getWordsByCollectionId = async (
    collectionId: string
): Promise<Word[]> => {
    const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false });
    if (error) throw error;
    return attachDefinitions(data ?? []);
};

export const getFavoriteWords = async (
    currentLanguageId: number
): Promise<WordDto[]> => {
    const { data, error } = await supabase
        .from("words")
        .select("*, collections(*)")
        .eq("is_favorite", true)
        .order("created_at", { ascending: false });
    if (error) throw error;

    const filtered = (data ?? []).filter(
        (w: any) => w.collections?.language_id === currentLanguageId
    );

    const words: Word[] = filtered.map((w: any) => ({ ...w, collection_id: w.collection_id }));
    const withDefs = await attachDefinitions(words);

    return withDefs.map((w, i) => ({
        ...w,
        collection: filtered[i].collections as Collection,
    }));
};

export const getWordsByLanguageCode = async (
    languageCode: string
): Promise<Word[]> => {
    const currentLanguageId = await getCurrentLanguageId(languages, languageCode);
    const collections = await getCollectionsByLanguageId(currentLanguageId);
    const collectionIds = collections.map((c) => c.id!);
    if (collectionIds.length === 0) return [];

    const { data, error } = await supabase
        .from("words")
        .select("*")
        .in("collection_id", collectionIds);
    if (error) throw error;
    return attachDefinitions(data ?? []);
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
    currentLanguageId: number
): Promise<Word> => {
    const userId = await getActiveUserId();

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
        });
    } else {
        collectionId = existing.id!;
    }

    const { definitions, ...wordFields } = objWord;
    const { data, error } = await supabase
        .from("words")
        .insert({
            ...wordFields,
            user_id: userId,
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
        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${w.replace(/\//g, "")}`
        );
        const data = await response.json();
        if (data instanceof Array) {
            for (const element of data[0].phonetics) {
                if (element.text) return element.text as string;
            }
        }
        return undefined;
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
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
    );
    const data = await response.json();
    const meanings = data[0].meanings as Array<any>;
    for (const meaning of meanings) {
        if (meaning.partOfSpeech === word.part_of_speech) {
            return { synonyms: meaning.synonyms, antonyms: meaning.antonyms };
        }
    }
    return undefined;
};

export const getExternalWord = async (
    word: string
): Promise<ExternalWord[] | { message: string }> => {
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();
    return data as ExternalWord[];
};
