import React, { useEffect, useState } from "react";
import "./App.css";
import { AddWordForm } from "./components/AddWordForm";
import initDB from "./utils/database";
import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "./interfaces/model";
import { getCollections } from "./services/CollectionService";
import { CollectionDisplay } from "./components/CollectionDisplay";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WordDisplay } from "./components/WordDisplay";
import { NavBar } from "./components/NavBar";

function App() {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [words, setWords] = useState<Word[]>([]);

    useEffect(() => {
        const initializeDB = async () => {
            const dbInstance = await initDB();
            setDb(dbInstance);
            const storedCollections = await getCollections(dbInstance);
            setCollections(storedCollections);

            // To monitor the storage of IndexedDB
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();

                const used = estimate.usage;
                const quota = estimate.quota;
                console.log(
                    `Used Storage: ${
                        used ? (used / 1024 / 1024).toFixed(2) : "N/A"
                    } MB`
                );
                console.log(
                    `Available Storage: ${
                        quota ? (quota / 1024 / 1024).toFixed(2) : "N/A"
                    } MB`
                );
            }
        };
        initializeDB();
    }, []);

    return (
        <BrowserRouter>
            <React.Fragment>
                <NavBar />
                <div className="container my-4">
                    <AddWordForm
                        db={db}
                        collections={collections}
                        setCollections={setCollections}
                        setWords={setWords}
                    />

                    <Routes>
                        <Route
                            path="/"
                            element={
                                <CollectionDisplay
                                    db={db}
                                    collections={collections}
                                    setCollections={setCollections}
                                    setWords={setWords}
                                />
                            }
                        />

                        <Route
                            path="/collection/:collectionId"
                            element={
                                <WordDisplay
                                    words={words}
                                    setWords={setWords}
                                />
                            }
                        />
                    </Routes>
                </div>
            </React.Fragment>
        </BrowserRouter>
    );
}

export default App;
