import React, { useEffect, useState } from "react";
import { MainLayoutProps } from "../interfaces/mainProps";
import { StorageBar } from "../components/StorageBar";
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
import { AddWordModal } from "../components/Modal/AddWordModal";
import { Toast, ToastType } from "../components/Toast";

const MainLayout: React.FC<MainLayoutProps> = ({
    db,
    collections,
    setCollections,
    setLanguageCode,
}) => {
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentCollectionId, setCurrentCollectionId] = useState<string>("");
    const [toast, setToast] = useState<{
        message: string;
        type: ToastType;
    } | null>(null);

    const { language } = useParams();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl + Enter or Cmd + Enter
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                const modalElement = document.getElementById("add-word");
                const isModalOpen = modalElement?.classList.contains("show");

                if (!isModalOpen) {
                    e.preventDefault();
                    const bootstrap = (window as any).bootstrap;
                    if (bootstrap) {
                        const modal = new bootstrap.Modal(modalElement);
                        modal.show();
                    } else {
                        const addWordBtn = document.querySelector('.btn-add-word') as HTMLButtonElement;
                        addWordBtn?.click();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
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
            setIsLoading(false);
        };
        fetchData();
    }, [language]);

    return (
        <div className="container my-4">
            <StorageBar />
            <AddWordModal
                db={db}
                collections={collections}
                setCollections={setCollections}
                setWords={setWords}
                collectionId={currentCollectionId}
                onShowToast={(message, type) => setToast({ message, type })}
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
                            onShowToast={(message, type) => setToast({ message, type })}
                            isLoading={isLoading}
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
                            onShowToast={(message, type) => setToast({ message, type })}
                            isLoading={isLoading}
                        />
                    }
                />
                <Route
                    path="/word/:wordId"
                    element={<WordDetailPage db={db} onShowToast={(message, type) => setToast({ message, type })} />}
                />
                <Route
                    path="/favorite"
                    element={
                        <FavoritePage
                            db={db}
                            collections={collections}
                            setCollections={setCollections}
                            setWords={setWords}
                            onShowToast={(message, type) => setToast({ message, type })}
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
                            onShowToast={(message, type) => setToast({ message, type })}
                        />
                    }
                />
                <Route path="/glossary" element={<GlossaryPage />} />
            </Routes>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default MainLayout;
