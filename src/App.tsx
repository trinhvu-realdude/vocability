import React, { useEffect, useState } from "react";
import "./App.css";
import initDB from "./configs/database";
import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "./interfaces/model";
import { getCollections } from "./services/CollectionService";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import MainLayout from "./layouts/MainLayout";
import PracticeLayout from "./layouts/PracticeLayout";
import RootLayout from "./layouts/RootLayout";

function App() {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        const initializeDB = async () => {
            const dbInstance = await initDB();
            const storedCollections = await getCollections(dbInstance);
            setDb(dbInstance);
            setCollections(storedCollections);
            console.log("initDB");
        };
        initializeDB();
    }, []);

    return (
        <BrowserRouter>
            <React.Fragment>
                <NavBar collections={collections} />

                {db && (
                    <Routes>
                        {/* For production */}
                        {/* <Route path="/" element={<RootLayout />} /> */}
                        <Route
                            path="/*"
                            element={
                                <MainLayout
                                    db={db}
                                    collections={collections}
                                    setWords={(): void => {}}
                                    setCollections={setCollections}
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
    );
}

export default App;
