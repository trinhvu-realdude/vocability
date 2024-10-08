import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word, WordDto } from "../interfaces/model";
import {
    addCollection,
    getCollectionById,
    getCollectionByNameAndLanguageId,
} from "./CollectionService";
import { EditWordObj, ExternalWord } from "../interfaces/mainProps";

const storeName = "words";

export const addWord = async (
    db: IDBPDatabase<MyDB>,
    objWord: Word,
    objCollection: Collection,
    currentLanguageId: number
): Promise<Word> => {
    let collectionId;
    const collection = await getCollectionByNameAndLanguageId(
        db,
        objCollection.name,
        currentLanguageId
    );

    if (!collection) collectionId = await addCollection(db, objCollection);
    else collectionId = collection.id;

    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const word = {
        ...objWord,
        collectionId: collectionId,
    };

    await store.add(word);
    await tx.done;

    return word;
};

export const getWords = async (db: IDBPDatabase<MyDB>): Promise<Word[]> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const words = await store.getAll();
    await tx.done;
    return words;
};

export const getWordById = async (
    db: IDBPDatabase<MyDB>,
    wordId: number
): Promise<Word | undefined> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const word = await store.get(wordId);
    return word;
};

export const getWordsByCollectionId = async (
    db: IDBPDatabase<MyDB>,
    collectionId: number
): Promise<Word[]> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const words = (await store.getAll()).filter(
        (word) => word.collectionId === collectionId
    );
    await tx.done;
    return words;
};

export const deleteWordsByCollectionId = async (
    db: IDBPDatabase<MyDB>,
    collectionId: number
): Promise<void> => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const words = (await store.getAll()).filter(
        (word) => word.collectionId === collectionId
    );

    for (const word of words) {
        if (word.id) {
            await store.delete(word.id);
        }
    }

    await tx.done;
};

export const deleteWord = async (
    db: IDBPDatabase<MyDB>,
    word: Word
): Promise<void> => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    if (word.id) await store.delete(word.id);
    await tx.done;
};

export const addWordToFavorite = async (
    db: IDBPDatabase<MyDB>,
    word: Word,
    isFavorite: boolean
): Promise<void> => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    if (word.id) {
        let objWord = await store.get(word.id);
        if (objWord) {
            objWord.isFavorite = isFavorite;
            await store.put(objWord);
            await tx.done;
        }
    }
};

export const getFavoriteWords = async (
    db: IDBPDatabase<MyDB>,
    currentLanguageId: number
): Promise<WordDto[]> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const words = (await store.getAll()).filter((word) => word.isFavorite);

    const favoriteWords: WordDto[] = [];

    for (const word of words) {
        const collectionId = word.collectionId;
        if (collectionId) {
            const collection = await getCollectionById(db, collectionId);
            if (collection && collection.languageId === currentLanguageId) {
                favoriteWords.push({
                    id: word.id,
                    collection: collection,
                    word: word.word,
                    phonetic: word.phonetic,
                    definition: word.definition,
                    notes: word.notes,
                    partOfSpeech: word.partOfSpeech,
                    isFavorite: word.isFavorite,
                    createdAt: word.createdAt,
                });
            }
        }
    }

    await tx.done;
    return favoriteWords;
};

export const updateWord = async (
    db: IDBPDatabase<MyDB>,
    word: Word,
    editValue: EditWordObj
): Promise<Word> => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    if (word.id) {
        let objWord = await store.get(word.id);
        if (objWord) {
            objWord.word = editValue.word;
            objWord.phonetic = editValue.phonetic;
            objWord.partOfSpeech = editValue.partOfSpeech;
            objWord.definition = editValue.definition;
            objWord.notes = editValue.notes;
            await store.put(objWord);
            await tx.done;
            return objWord;
        }
    }
    return word;
};

export const getPhonetic = async (
    word: string
): Promise<string | undefined> => {
    const fetchPhonetic = async (w: string) => {
        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${w}`
        );
        const data = await response.json();

        if (data instanceof Array) {
            const phonetics = data[0].phonetics;

            for (const element of phonetics) {
                if (element.text) {
                    return element.text;
                }
            }
        }
        return undefined;
    };

    const phonetic = await fetchPhonetic(word);
    if (!phonetic) {
        let result = "";
        for (const w of word.split(" ")) {
            const data = await fetchPhonetic(w);
            if (data) {
                result += data + " ";
            } else {
                return undefined;
            }
        }
        return "/" + result.replace(/\//g, "").trim() + "/";
    }
    return phonetic;
};

export const getSynonymsAntonyms = async (
    word: Word
): Promise<{ synonyms: string[]; antonyms: string[] } | undefined> => {
    // if (word.word.split(" ").length > 1) {
    //     return undefined;
    // }
    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
    );
    const data = await response.json();
    const meanings = data[0].meanings as Array<any>;

    for (const meaning of meanings) {
        if (meaning.partOfSpeech === word.partOfSpeech) {
            const result = {
                synonyms: meaning.synonyms,
                antonyms: meaning.antonyms,
            };
            return result;
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
