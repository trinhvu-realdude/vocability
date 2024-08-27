import React, { useState } from "react";
import { MainLayoutProps } from "../interfaces/mainProps";
import { StorageBar } from "../components/StorageBar";
import { AddWordForm } from "../components/Form/AddWordForm";
import { Route, Routes } from "react-router-dom";
import { WordPage } from "../pages/WordPage";
import { FavoritePage } from "../pages/FavoritePage";
import { ExportPage } from "../pages/ExportPage";
import { CollectionPage } from "../pages/CollectionPage";
import { GlossaryPage } from "../pages/GlossaryPage";
import { Word } from "../interfaces/model";

const MainLayout: React.FC<MainLayoutProps> = ({
    db,
    collections,
    setCollections,
}) => {
    const [words, setWords] = useState<Word[]>([]);
    const [currentCollectionId, setCurrentCollectionId] = useState<string>("");

    return (
        <div className="container my-4">
            <StorageBar />
            <AddWordForm
                db={db}
                collections={collections}
                setCollections={setCollections}
                setWords={setWords}
                collectionId={currentCollectionId}
            />

            <Routes>
                <Route
                    path="/collections"
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
                            db={db}
                            words={words}
                            setWords={setWords}
                            setCollections={setCollections}
                            setCurrentCollectionId={setCurrentCollectionId}
                        />
                    }
                />
                <Route
                    path="/favorite"
                    element={
                        <FavoritePage
                            db={db}
                            collections={collections}
                            setCollections={setCollections}
                            setWords={setWords}
                        />
                    }
                />
                <Route
                    path="/export"
                    element={
                        <ExportPage
                            db={db}
                            collections={collections}
                            setCollections={setCollections}
                            setWords={setWords}
                        />
                    }
                />
                <Route path="/glossary" element={<GlossaryPage />} />
            </Routes>
        </div>
    );
};

export default MainLayout;
