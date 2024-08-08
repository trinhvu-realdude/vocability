import React, { useEffect, useState } from "react";
import "./App.css";
import initDB from "./utils/database";
import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "./interfaces/model";
import { getCollections } from "./services/CollectionService";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import MainLayout from "./layouts/MainLayout";
import PracticeLayout from "./layouts/PracticeLayout";
import RootLayout from "./layouts/RootLayout";

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
        };
        initializeDB();
    }, []);

    return (
        <BrowserRouter>
            <React.Fragment>
                <NavBar collections={collections} />
                <Routes>
                    <Route path="/" element={<RootLayout />} />
                    <Route
                        path="/app/*"
                        element={
                            <MainLayout
                                db={db}
                                collectionId={currentCollectionId}
                                words={words}
                                collections={collections}
                                setWords={setWords}
                                setCollections={setCollections}
                                setCurrentCollectionId={setCurrentCollectionId}
                            />
                        }
                    />

                    <Route
                        path="/app/practices/*"
                        element={<PracticeLayout />}
                    />
                </Routes>
            </React.Fragment>
        </BrowserRouter>
    );
}

export default App;
