import { openDB, IDBPDatabase } from "idb";
import { MyDB } from "../interfaces/model";

const dbName = "vocability";
const storeNames = ["collections", "words"] as const;

const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
    const db = await openDB<MyDB>(dbName, 1, {
        upgrade(db) {
            storeNames.forEach((storeName) => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, {
                        keyPath: "id",
                        autoIncrement: true,
                    });
                }
            });
        },
    });

    return db;
};

export default initDB;
