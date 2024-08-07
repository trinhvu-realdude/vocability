import React from "react";
import { MainLayoutProps } from "../interfaces/props";
import { StorageBar } from "../components/StorageBar";
import { AddWordForm } from "../components/WordForm";
import { Route, Routes } from "react-router-dom";
import { WordPage } from "../pages/WordPage";
import { FavoritePage } from "../pages/FavoritePage";
import { ImportExportPage } from "../pages/ImportExportPage";
import { CollectionPage } from "../pages/CollectionPage";
import { GlossaryPage } from "../pages/GlossaryPage";

const MainLayout: React.FC<MainLayoutProps> = ({
    db,
    collections,
    collectionId,
    words,
    setWords,
    setCollections,
    setCurrentCollectionId,
}) => {
    return (
        <div className="container my-4">
            <StorageBar />
            <AddWordForm
                db={db}
                collections={collections}
                setCollections={setCollections}
                setWords={setWords}
                collectionId={collectionId}
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
                            setCollections={setCollections}
                            setCurrentCollectionId={setCurrentCollectionId}
                        />
                    }
                />
                <Route
                    path="/favorite-collection"
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
                    path="/import-export"
                    element={
                        <ImportExportPage
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
