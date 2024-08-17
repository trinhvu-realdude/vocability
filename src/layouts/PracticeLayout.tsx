import { Route, Routes } from "react-router-dom";
import { PracticePage } from "../pages/PracticePage";
import { FlashcardQuizPage } from "../pages/FlashcardQuizPage";
import { PracticeLayoutProps } from "../interfaces/practiceProps";

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
            </Routes>
        </div>
    );
};

export default PracticeLayout;
