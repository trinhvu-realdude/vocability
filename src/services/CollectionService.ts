import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "../interfaces/model";
import { deleteWordsByCollectionId, getWords } from "./WordService";

const storeName = "collections";

export const getCollections = async (
    db: IDBPDatabase<MyDB>
): Promise<Collection[]> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);

    const collections = await store.getAll();
    const words = await getWords(db);

    await tx.done;

    collections.forEach((collection) => {
        collection.numOfWords = words.filter(
            (word) => word.collectionId === collection.id
        ).length;
    });

    return collections;
};

export const addCollection = async (
    db: IDBPDatabase<MyDB>,
    collection: Collection
): Promise<number> => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const collectionId = await store.add(collection);
    await tx.done;
    return collectionId;
};

export const getCollectionByName = async (
    db: IDBPDatabase<MyDB>,
    name: string
): Promise<Collection | undefined> => {
    const collections: Collection[] = await getCollections(db);
    return collections.find((collection) => collection.name === name);
};

export const getCollectionById = async (
    db: IDBPDatabase<MyDB>,
    id: number
): Promise<Collection | undefined> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const collection = await store.get(id);
    return collection;
};

export const deleteCollection = async (
    db: IDBPDatabase<MyDB>,
    collection: Collection
): Promise<void> => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    if (collection.id) {
        await store.delete(collection.id);
        await deleteWordsByCollectionId(db, collection.id);
    }
    await tx.done;
};

export const updateCollection = async (
    db: IDBPDatabase<MyDB>,
    collection: Collection,
    renameValue: string,
    color: string
): Promise<Collection> => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    if (collection.id) {
        let objCollection = await store.get(collection.id);
        if (objCollection) {
            objCollection.name = renameValue;
            objCollection.color = color;
            await store.put(objCollection);
            await tx.done;
            return objCollection;
        }
    }
    return collection;
};
