import { Route, Routes, useParams } from "react-router-dom";
import { PracticePage } from "../pages/PracticePage";
import { FlashcardQuizPage } from "../pages/practice/FlashcardQuizPage";
import { PracticeLayoutProps } from "../interfaces/practiceProps";
import { CrosswordPuzzlePage } from "../pages/practice/CrosswordPuzzlePage";
import { WordScramblePage } from "../pages/practice/WordScramblePage";
import { VocabularyQuizPage } from "../pages/practice/VocabularyQuizPage";
import { WordMatchingPage } from "../pages/practice/WordMatchingPage";
import { MemoryCardPage } from "../pages/practice/MemoryCardPage";
import { useEffect } from "react";
import { getCollectionsByLanguageId } from "../services/CollectionService";
import { getCurrentLanguageId } from "../utils/helper";
import { languages } from "../utils/constants";

const PracticeLayout: React.FC<PracticeLayoutProps> = ({
    db,
    collections,
    setCollections,
    setLanguageCode,
}) => {
    const { language } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            if (db && language && setLanguageCode) {
                setLanguageCode(language);
                const currentLanguageId = await getCurrentLanguageId(
                    languages,
                    language
                );
                const collectionsByLanguage = await getCollectionsByLanguageId(
                    db,
                    currentLanguageId
                );
                if (setCollections) setCollections(collectionsByLanguage);
            }
        };
        fetchData();
    }, [language]);

    return (
        <div className="container my-4">
            <Routes>
                <Route path="/" element={<PracticePage />} />
                <Route
                    path="/flashcard-quiz"
                    element={
                        <FlashcardQuizPage db={db} collections={collections} />
                    }
                />
                <Route
                    path="/crossword-puzzles"
                    element={<CrosswordPuzzlePage db={db} />}
                />
                <Route path="/word-scramble" element={<WordScramblePage />} />
                <Route
                    path="/vocabulary-quiz"
                    element={<VocabularyQuizPage db={db} />}
                />
                <Route path="/word-matching" element={<WordMatchingPage />} />
                <Route path="/memory-card" element={<MemoryCardPage />} />
            </Routes>
        </div>
    );
};

export default PracticeLayout;
