import React, { useEffect, useState } from "react";
import "./App.css";
import initDB from "./configs/database";
import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "./interfaces/model";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import MainLayout from "./layouts/MainLayout";
import PracticeLayout from "./layouts/PracticeLayout";
import RootLayout from "./layouts/RootLayout";
import { LanguageProvider } from "./LanguageContext";
import { ButtonOnTop } from "./components/ButtonOnTop";

import { AddWordModal } from "./components/Modal/AddWordModal";

function App() {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [languageCode, setLanguageCode] = useState<string>("");
    const [activeLanguages, setActiveLanguages] = useState<Array<any>>([]);
    const [selectedWord, setSelectedWord] = useState<Word | undefined>(
        undefined
    );
    const [quickAddWord, setQuickAddWord] = useState<string>("");

    useEffect(() => {
        const initializeDB = async () => {
            const dbInstance = await initDB();
            setDb(dbInstance);
            console.log("initDB");
        };
        initializeDB();
    }, []);

    const handleQuickAddWord = (word: string) => {
        setQuickAddWord(word);
    };

    return (
        <LanguageProvider
            languageCode={languageCode}
            setLanguageCode={setLanguageCode}
            activeLanguages={activeLanguages}
            setActiveLanguages={setActiveLanguages}
            selectedWord={selectedWord}
            setSelectedWord={setSelectedWord}
        >
            <BrowserRouter>
                <React.Fragment>
                    <NavBar
                        db={db}
                        languageCode={languageCode}
                        onQuickAddWord={handleQuickAddWord}
                    />

                    {/* Global Add Word Modal for Quick Search */}
                    <AddWordModal
                        db={db}
                        collections={collections}
                        setCollections={setCollections}
                        setWords={() => { }} // No-op, effectively global
                        modalId="global-add-word"
                        initialWord={quickAddWord}
                    />

                    {db && (
                        <Routes>
                            <Route path="/" element={<RootLayout db={db} />} />
                            <Route
                                path="/:language/*"
                                element={
                                    <MainLayout
                                        db={db}
                                        collections={collections}
                                        setWords={(): void => { }}
                                        setCollections={setCollections}
                                        setLanguageCode={setLanguageCode}
                                    />
                                }
                            />

                            <Route
                                path="/:language/practices/*"
                                element={
                                    <PracticeLayout
                                        db={db}
                                        collections={collections}
                                        setCollections={setCollections}
                                        setLanguageCode={setLanguageCode}
                                    />
                                }
                            />
                        </Routes>
                    )}

                    <ButtonOnTop />
                </React.Fragment>
            </BrowserRouter>
        </LanguageProvider>
    );
}

export default App;
