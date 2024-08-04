import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "../interfaces/interface";
import { addCollection, findCollectionByName } from "./CollectionService";

const storeName = "words";

export const addWord = async (
    db: IDBPDatabase<MyDB>,
    objWord: Word,
    objCollection: Collection
): Promise<void> => {
    let collectionId;
    const collection = await findCollectionByName(db, objCollection.name);

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
};

export const getWords = async (db: IDBPDatabase<MyDB>): Promise<Word[]> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const words = await store.getAll();
    await tx.done;
    return words;
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
