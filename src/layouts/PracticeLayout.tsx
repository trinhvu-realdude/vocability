import { Route, Routes, useParams } from "react-router-dom";
import { PracticePage } from "../pages/PracticePage";
import { FlashcardQuizPage } from "../pages/practice/FlashcardQuizPage";
import { PracticeLayoutProps } from "../interfaces/practiceProps";
import { CrosswordPuzzlePage } from "../pages/practice/CrosswordPuzzlePage";
import { WordScramblePage } from "../pages/practice/WordScramblePage";
import { VocabularyQuizPage } from "../pages/practice/VocabularyQuizPage";
import { WordMatchingPage } from "../pages/practice/WordMatchingPage";
import { MemoryCardPage } from "../pages/practice/MemoryCardPage";
import { useEffect, useState } from "react";
import { getCurrentLanguageId } from "../utils/helper";
import { getCollectionsByLanguageId } from "../services/CollectionService";
import { getSharedCollections } from "../services/ShareService";
import { languages } from "../utils/constants";
import { Toast, ToastType } from "../components/Toast";

const PracticeLayout: React.FC<PracticeLayoutProps> = ({
    collections,
    setCollections,
    setLanguageCode,
}) => {
    const { language } = useParams();
    const [toast, setToast] = useState<{
        message: string;
        type: ToastType;
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (language && setLanguageCode) {
                setLanguageCode(language);
                const currentLanguageId = await getCurrentLanguageId(languages, language);

                const [ownedCollections, sharedCollections] = await Promise.all([
                    getCollectionsByLanguageId(currentLanguageId),
                    getSharedCollections(currentLanguageId),
                ]);

                // Merge: owned first, then shared (viewer + editor)
                const merged = [
                    ...ownedCollections,
                    ...sharedCollections,
                ];

                if (setCollections) setCollections(merged);
            }
        };
        fetchData();
    }, [language]);

    return (
        <div className="container my-4">
            <Routes>
                <Route path="/" element={<PracticePage collections={collections} onShowToast={(message, type) => setToast({ message, type })} />} />
                <Route
                    path="/flashcard-quiz"
                    element={<FlashcardQuizPage collections={collections} />}
                />
                <Route
                    path="/crossword-puzzles"
                    element={<CrosswordPuzzlePage collections={collections} />}
                />
                <Route path="/word-scramble" element={<WordScramblePage collections={collections} />} />
                <Route
                    path="/vocabulary-quiz"
                    element={<VocabularyQuizPage collections={collections} />}
                />
                <Route path="/word-matching" element={<WordMatchingPage collections={collections} />} />
                <Route path="/memory-card" element={<MemoryCardPage />} />
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

export default PracticeLayout;
