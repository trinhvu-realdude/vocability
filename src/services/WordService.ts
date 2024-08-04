import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "../interfaces";
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
