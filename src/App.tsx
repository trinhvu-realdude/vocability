import React, { useEffect, useState } from "react";
import "./App.css";
import { AddWordForm } from "./components/WordForm";
import initDB from "./utils/database";
import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "./interfaces/model";
import { getCollections } from "./services/CollectionService";
import { CollectionPage } from "./pages/CollectionPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WordPage } from "./pages/WordPage";
import { NavBar } from "./components/NavBar";
import { GlossaryPage } from "./pages/GlossaryPage";

function App() {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [words, setWords] = useState<Word[]>([]);
    const [currentCollectionId, setCurrentCollectionId] = useState<string>("");

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
                <NavBar collections={collections} />
                <div className="container my-4">
                    <AddWordForm
                        db={db}
                        collections={collections}
                        setCollections={setCollections}
                        setWords={setWords}
                        collectionId={currentCollectionId}
                    />

                    <Routes>
                        <Route
                            path="/"
                            element={
                                <CollectionPage
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
                                <WordPage
                                    words={words}
                                    setWords={setWords}
                                    setCurrentCollectionId={
                                        setCurrentCollectionId
                                    }
                                />
                            }
                        />
                        <Route path="/glossary" element={<GlossaryPage />} />
                    </Routes>
                </div>
            </React.Fragment>
        </BrowserRouter>
    );
}

export default App;
