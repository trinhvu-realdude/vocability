import React, { useEffect, useState } from "react";
import { MainLayoutProps } from "../interfaces/mainProps";
import { StorageBar } from "../components/StorageBar";
import { Route, Routes, useParams } from "react-router-dom";
import { WordPage } from "../pages/WordPage";
import { FavoritePage } from "../pages/FavoritePage";
import { ExportPage } from "../pages/ExportPage";
import { CollectionPage } from "../pages/CollectionPage";
import { GlossaryPage } from "../pages/GlossaryPage";
import { Word, Collection } from "../interfaces/model";
import { WordDetailPage } from "../pages/WordDetailPage";
import { getCurrentLanguageId } from "../utils/helper";
import { languages } from "../utils/constants";
import { getCollectionsByLanguageId } from "../services/CollectionService";
import { getSharedCollections } from "../services/ShareService";
import { AddWordModal } from "../components/Modal/AddWordModal";
import { getActiveUserId } from "../services/AuthService";
import { Toast, ToastType } from "../components/Toast";

const MainLayout: React.FC<MainLayoutProps> = ({
    collections,
    setCollections,
    setLanguageCode,
}) => {
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentCollectionId, setCurrentCollectionId] = useState<string>("");
    const [sharedCollections, setSharedCollections] = useState<Collection[]>([]);
    const [userId, setUserId] = useState<string | undefined>();
    const [toast, setToast] = useState<{
        message: string;
        type: ToastType;
    } | null>(null);

    const { language } = useParams();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
            if (language) {
                setLanguageCode(language);
                const [currentLanguageId, uid] = await Promise.all([
                    getCurrentLanguageId(languages, language),
                    getActiveUserId()
                ]);
                setUserId(uid);
                
                // Fetch both owned and shared collections for this language
                const [owned, shared] = await Promise.all([
                    getCollectionsByLanguageId(currentLanguageId, uid),
                    getSharedCollections(currentLanguageId, uid)
                ]);
                
                setCollections(owned);
                setSharedCollections(shared);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [language]);

    return (
        <div className="container my-4">
            <StorageBar />
            <AddWordModal
                userId={userId}
                collections={[...collections, ...sharedCollections]}
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
                            collections={collections}
                            sharedCollections={sharedCollections}
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
                            userId={userId}
                            words={words}
                            setWords={setWords}
                            setCollections={setCollections}
                            setCurrentCollectionId={setCurrentCollectionId}
                            onShowToast={(message, type) => setToast({ message, type })}
                            isLoading={isLoading}
                            collections={collections}
                            sharedCollections={sharedCollections}
                        />
                    }
                />
                <Route
                    path="/word/:wordId"
                    element={
                        <WordDetailPage 
                            onShowToast={(message, type) => setToast({ message, type })} 
                            collections={collections}
                            sharedCollections={sharedCollections}
                        />
                    }
                />
                <Route
                    path="/favorite"
                    element={
                        <FavoritePage
                            userId={userId}
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
                            userId={userId}
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
