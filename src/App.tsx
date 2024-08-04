import { useEffect, useState } from "react";
import "./App.css";
import { AddWordForm } from "./components/AddWordForm";
import initDB from "./utils/database";
import { IDBPDatabase } from "idb";
import { MyDB } from "./interfaces";
import { getCollections } from "./services/CollectionService";

function App() {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();
    const [collections, setCollections] = useState<Object[]>([]);

    useEffect(() => {
        const initializeDB = async () => {
            const dbInstance = await initDB();
            setDb(dbInstance);
            const storedCollections = await getCollections(dbInstance);
            const filteredCollections = storedCollections.map((collection) => {
                return {
                    label: collection.name,
                    value: collection.name,
                };
            });
            setCollections(filteredCollections);
        };
        initializeDB();
    }, []);
    return (
        <div className="container mt-4">
            <AddWordForm collections={collections} db={db} />
            
        </div>
    );
}

export default App;
