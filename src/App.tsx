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
    const [languageCode, setLanguageCode] = useState<string>("us");

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
        >
            <BrowserRouter>
                <React.Fragment>
                    <NavBar
                        collections={collections}
                        languageCode={languageCode}
                    />

                    {db && (
                        <Routes>
                            {/* For production */}
                            <Route path="/" element={<RootLayout />} />
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
                                path="/practices/*"
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
