import React, { useEffect, useState } from "react";
import "./App.css";
import initDB from "./configs/database";
import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "./interfaces/model";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import MainLayout from "./layouts/MainLayout";
import PracticeLayout from "./layouts/PracticeLayout";
import RootLayout from "./layouts/RootLayout";
import { LanguageProvider } from "./LanguageContext";

function App() {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [languageCode, setLanguageCode] = useState<string>("");
    const [activeLanguages, setActiveLanguages] = useState<Array<any>>([]);

    useEffect(() => {
        const initializeDB = async () => {
            const dbInstance = await initDB();
            setDb(dbInstance);
            console.log("initDB");
        };
        initializeDB();
    }, []);

    return (
        <LanguageProvider
            languageCode={languageCode}
            setLanguageCode={setLanguageCode}
            activeLanguages={activeLanguages}
            setActiveLanguages={setActiveLanguages}
        >
            <BrowserRouter>
                <React.Fragment>
                    <NavBar
                        db={db}
                        collections={collections}
                        languageCode={languageCode}
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
                                        setWords={(): void => {}}
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
                                    />
                                }
                            />
                        </Routes>
                    )}
                </React.Fragment>
            </BrowserRouter>
        </LanguageProvider>
    );
}

export default App;
