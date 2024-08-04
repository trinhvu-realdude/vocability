import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "../interfaces";

const storeName = "collections";

export const getCollections = async (
    db: IDBPDatabase<MyDB>
): Promise<Collection[]> => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const collections = await store.getAll();
    await tx.done;
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

export const findCollectionByName = async (
    db: IDBPDatabase<MyDB>,
    name: string
): Promise<Collection | undefined> => {
    const collections: Collection[] = await getCollections(db);
    return collections.find((collection) => collection.name === name);
};
