import { Route, Routes } from "react-router-dom";
import { PracticePage } from "../pages/PracticePage";
import { FlashcardQuizPage } from "../pages/practice/FlashcardQuizPage";
import { PracticeLayoutProps } from "../interfaces/practiceProps";
import { CrosswordPuzzlePage } from "../pages/practice/CrosswordPuzzlePage";
import { WordScramblePage } from "../pages/practice/WordScramblePage";
import { VocabularyQuizPage } from "../pages/practice/VocabularyQuizPage";
import { WordMatchingPage } from "../pages/practice/WordMatchingPage";
import { MemoryCardPage } from "../pages/practice/MemoryCardPage";

const PracticeLayout: React.FC<PracticeLayoutProps> = ({ db, collections }) => {
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
