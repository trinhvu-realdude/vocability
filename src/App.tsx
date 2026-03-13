import React, { useState } from "react";
import "./App.css";
import { Collection, Word } from "./interfaces/model";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import MainLayout from "./layouts/MainLayout";
import PracticeLayout from "./layouts/PracticeLayout";
import RootLayout from "./layouts/RootLayout";
import { LanguageProvider } from "./LanguageContext";
import { ButtonOnTop } from "./components/ButtonOnTop";
import { AddWordModal } from "./components/Modal/AddWordModal";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

function App() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [languageCode, setLanguageCode] = useState<string>("");
    const [activeLanguages, setActiveLanguages] = useState<Array<any>>([]);
    const [selectedWord, setSelectedWord] = useState<Word | undefined>(undefined);
    const [quickAddWord, setQuickAddWord] = useState<string>("");

    const handleQuickAddWord = (word: string) => {
        setQuickAddWord(word);
    };

    return (
        <AuthProvider>
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
                        <Routes>
                            {/* Public route */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Protected routes */}
                            <Route
                                path="/*"
                                element={
                                    <ProtectedRoute>
                                        <>
                                            <NavBar
                                                languageCode={languageCode}
                                                onQuickAddWord={handleQuickAddWord}
                                            />

                                            {/* Global Add Word Modal */}
                                            <AddWordModal
                                                collections={collections}
                                                setCollections={setCollections}
                                                setWords={() => {}}
                                                modalId="global-add-word"
                                                initialWord={quickAddWord}
                                            />

                                            <Routes>
                                                <Route path="/" element={<RootLayout />} />
                                                <Route
                                                    path="/:language/*"
                                                    element={
                                                        <MainLayout
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
                                                            collections={collections}
                                                            setCollections={setCollections}
                                                            setLanguageCode={setLanguageCode}
                                                        />
                                                    }
                                                />
                                                {/* Fallback */}
                                                <Route path="*" element={<Navigate to="/" replace />} />
                                            </Routes>

                                            <ButtonOnTop />
                                        </>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </React.Fragment>
                </BrowserRouter>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
