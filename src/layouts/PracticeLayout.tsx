import { Route, Routes } from "react-router-dom";
import { PracticePage } from "../pages/PracticePage";
import { FlashcardQuizPage } from "../pages/FlashcardQuizPage";
import { PracticeLayoutProps } from "../interfaces/practiceProps";
import { CrosswordPuzzlePage } from "../pages/CrosswordPuzzlePage";

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
                    element={<CrosswordPuzzlePage />}
                />
            </Routes>
        </div>
    );
};

export default PracticeLayout;
