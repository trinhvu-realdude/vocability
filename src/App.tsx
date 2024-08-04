import React, { useEffect, useState } from "react";
import "./App.css";
import { AddWordForm } from "./components/AddWordForm";
import initDB from "./utils/database";
import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "./interfaces/interface";
import { getCollections } from "./services/CollectionService";
import { CollectionDisplay } from "./components/CollectionDisplay";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WordDisplay } from "./components/WordDisplay";

function App() {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        const initializeDB = async () => {
            const dbInstance = await initDB();
            setDb(dbInstance);
            const storedCollections = await getCollections(dbInstance);
            setCollections(storedCollections);
        };
        initializeDB();
    }, []);

    return (
        <div className="container mt-4">
            <BrowserRouter>
                <React.Fragment>
                    <AddWordForm collections={collections} db={db} />

                    <Routes>
                        <Route
                            path="/"
                            element={
                                <CollectionDisplay
                                    collections={collections}
                                    db={db}
                                />
                            }
                        />

                        <Route
                            path="/collection/:collectionId"
                            element={<WordDisplay />}
                        />
                    </Routes>
                </React.Fragment>
            </BrowserRouter>
        </div>
    );
}

export default App;
