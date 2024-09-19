import { PageHeader } from "../../components/PageHeader";
import { PracticeMessage } from "../../components/PracticeMessage";
import { VocabularyQuizPageProps } from "../../interfaces/practiceProps";
// import { generateQuestionsForVocabularyQuiz } from "../../services/PracticeService";

export const VocabularyQuizPage: React.FC<VocabularyQuizPageProps> = ({
    db,
}) => {
    const handleGenerateQuiz = async () => {
        if (db) {
            // const questions = await generateQuestionsForVocabularyQuiz(db);
        }
    };

    return (
        <div className="container-list" id="vocabulary-quiz">
            <PageHeader href="/practices" content="Vocabulary Quiz" />

            <div className="text-center my-4">
                <button
                    className="btn btn-outline-success mb-4"
                    onClick={handleGenerateQuiz}
                >
                    Generate quiz
                </button>

                <PracticeMessage message="📝 Click Generate quiz and test your vocabulary skills" />
            </div>
        </div>
    );
};
