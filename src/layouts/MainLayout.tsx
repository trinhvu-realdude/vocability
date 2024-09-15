import React, { useEffect, useState } from "react";
import { MainLayoutProps } from "../interfaces/mainProps";
import { StorageBar } from "../components/StorageBar";
import { AddWordForm } from "../components/Form/AddWordForm";
import { Route, Routes, useParams } from "react-router-dom";
import { WordPage } from "../pages/WordPage";
import { FavoritePage } from "../pages/FavoritePage";
import { ExportPage } from "../pages/ExportPage";
import { CollectionPage } from "../pages/CollectionPage";
import { GlossaryPage } from "../pages/GlossaryPage";
import { Word } from "../interfaces/model";
import { WordDetailPage } from "../pages/WordDetailPage";
import { getCurrentLanguageId } from "../utils/helper";
import { languages } from "../utils/constants";
import { getCollectionsByLanguageId } from "../services/CollectionService";

const MainLayout: React.FC<MainLayoutProps> = ({
    db,
    collections,
    setCollections,
    setLanguageCode,
}) => {
    const [words, setWords] = useState<Word[]>([]);
    const [currentCollectionId, setCurrentCollectionId] = useState<string>("");

    const { language } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            if (db && language) {
                setLanguageCode(language);
                const currentLanguageId = await getCurrentLanguageId(
                    languages,
                    language
                );
                const storedCollections = await getCollectionsByLanguageId(
                    db,
                    currentLanguageId
                );
                setCollections(storedCollections);
            }
        };
        fetchData();
    }, [language]);

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
                    path="/word/:wordId"
                    element={<WordDetailPage db={db} />}
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
