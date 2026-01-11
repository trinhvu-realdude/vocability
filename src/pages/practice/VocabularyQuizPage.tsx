import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { VocabularyQuizPageProps } from "../../interfaces/practiceProps";
import { useLanguage } from "../../LanguageContext";
import { getWordsByCollectionId } from "../../services/WordService";
import { getCollectionById } from "../../services/CollectionService";
import { NoDataMessage } from "../../components/NoDataMessage";
import { APP_NAME } from "../../utils/constants";
import "../../styles/VocabularyQuiz.css";
import { useRef } from "react";
import { handleTextToSpeech } from "../../utils/helper";


interface QuizQuestion {
    id: number;
    definition: string;
    correctAnswer: string;
    options: string[];
    correctWordId?: number;
}

interface QuizAnswer {
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
}

export const VocabularyQuizPage: React.FC<VocabularyQuizPageProps> = ({ db, collections }) => {
    const { translations } = useLanguage();
    document.title = `Vocabulary Quiz | ${APP_NAME}`;

    const [searchParams] = useSearchParams();
    const collectionIdParam = searchParams.get("collectionId");

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isQuizStarted, setIsQuizStarted] = useState(false);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [cardColor, setCardColor] = useState<string>("#6c757d");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (collectionIdParam && db) {
            handleStartQuiz(Number(collectionIdParam));
        }
    }, [collectionIdParam, db]);

    const handleStartQuiz = async (collectionId: number) => {
        if (!db) return;

        const collection = await getCollectionById(db, collectionId);
        setCardColor(collection ? collection.color : "#6c757d");

        let words = await getWordsByCollectionId(db, collectionId);

        // Filter words that have definitions
        words = words.filter(word => word.definitions && word.definitions.length > 0);

        if (words.length < 4) {
            // Need at least 4 words to create meaningful questions
            setIsQuizStarted(false);
            return;
        }

        // Shuffle and take up to 10 questions
        const shuffledWords = words.sort(() => Math.random() - 0.5);
        const selectedWords = shuffledWords.slice(0, Math.min(10, words.length));

        // Generate questions
        const generatedQuestions: QuizQuestion[] = selectedWords.map((word, index) => {
            const correctAnswer = word.word;
            const definition = word.definitions[0].definition;

            // Get 3 random wrong answers from other words
            const otherWords = words.filter(w => w.id !== word.id);
            const shuffledOthers = otherWords.sort(() => Math.random() - 0.5);
            const wrongAnswers = shuffledOthers.slice(0, 3).map(w => w.word);

            // Combine and shuffle options
            const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

            return {
                id: index,
                definition,
                correctAnswer,
                options,
                correctWordId: word.id
            };
        });

        setQuestions(generatedQuestions);
        setIsQuizStarted(true);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setIsQuizCompleted(false);
    };

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;

        setSelectedAnswer(answer);
        setIsAnswered(true);

        const currentQuestion = questions[currentQuestionIndex];
        handleTextToSpeech(currentQuestion.correctAnswer, translations["language"]);
        const isCorrect = answer === currentQuestion.correctAnswer;

        setAnswers([...answers, {
            questionId: currentQuestion.id,
            selectedAnswer: answer,
            isCorrect
        }]);

        // ⬇️ scroll to bottom
        setTimeout(() => {
            bottomRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }, 100);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setIsQuizCompleted(true);
        }
    };

    const handleRestartQuiz = () => {
        if (collectionIdParam && db) {
            handleStartQuiz(Number(collectionIdParam));
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const score = answers.filter(a => a.isCorrect).length;
    const scorePercentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
        <div className="container-list" id="vocabulary-quiz">
            <PageHeader content={translations["practice.quiz"]} />

            {isQuizStarted && !isQuizCompleted && (
                <div className="container-fluid p-0 mt-4">
                    {/* Progress Bar */}
                    <div className="quiz-progress mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="quiz-progress-text">
                            <span>{translations["flashcard.question"]} {currentQuestionIndex + 1} {translations["review.of"]} {questions.length}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="quiz-progress-bar-container">
                            <div
                                className="quiz-progress-bar"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                                }}
                            ></div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="row justify-content-center">
                        <div className="col-md-10 col-lg-8">
                            <div className="quiz-question-card" style={{ borderColor: cardColor }}>
                                <div className="quiz-question-header" style={{ backgroundColor: cardColor }}>
                                    <i className="fas fa-question-circle me-2"></i>
                                    {translations["flashcard.titleQuestion"]}
                                </div>
                                <div className="quiz-question-body">
                                    <div className="quiz-definition">
                                        {currentQuestion.definition}
                                    </div>
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div className="quiz-options-container mt-4">
                                {currentQuestion.options.map((option, index) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrect = option === currentQuestion.correctAnswer;

                                    let optionClass = "quiz-option";
                                    if (isAnswered) {
                                        if (isCorrect) {
                                            optionClass += " correct";
                                        } else if (isSelected && !isCorrect) {
                                            optionClass += " incorrect";
                                        }
                                    } else if (isSelected) {
                                        optionClass += " selected";
                                    }

                                    return (
                                        <button
                                            key={index}
                                            className={optionClass}
                                            onClick={() => handleAnswerSelect(option)}
                                            disabled={isAnswered}
                                            style={{
                                                borderColor: isAnswered && isCorrect ? '#28a745' :
                                                    isAnswered && isSelected && !isCorrect ? '#dc3545' :
                                                        cardColor
                                            }}
                                        >
                                            <span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span>
                                            <span className="quiz-option-text">{option}</span>
                                            {isAnswered && isCorrect && (
                                                <i className="fas fa-check-circle quiz-option-icon"></i>
                                            )}
                                            {isAnswered && isSelected && !isCorrect && (
                                                <i className="fas fa-times-circle quiz-option-icon"></i>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            {isAnswered && (
                                <div className="text-center mt-4" ref={bottomRef}>
                                    <button
                                        className="quiz-next-btn"
                                        onClick={handleNextQuestion}
                                        style={{ backgroundColor: cardColor }}
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? (
                                            <>
                                                {translations["flashcard.nextQuestion"]}
                                                <i className="fas fa-arrow-right ms-2"></i>
                                            </>
                                        ) : (
                                            <>
                                                {translations["flashcard.viewResults"]}
                                                <i className="fas fa-flag-checkered ms-2"></i>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isQuizCompleted && (
                <div className="container-fluid p-0 mt-4">
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <div className="quiz-results-card">
                                <h2 className="quiz-results-title">{translations["flashcard.resultsTitle"]}</h2>
                                <p className="quiz-results-subtitle">{translations["flashcard.resultsText"]}</p>

                                <div className="quiz-score-circle" style={{ borderColor: cardColor }}>
                                    <div className="quiz-score-percentage" style={{ color: cardColor }}>
                                        {scorePercentage}%
                                    </div>
                                    <div className="quiz-score-text">
                                        {score} / {questions.length} {translations["flashcard.correctLower"]}
                                    </div>
                                </div>

                                <div className="quiz-results-stats">
                                    <div className="quiz-results-stat">
                                        <i className="fas fa-check-circle" style={{ color: '#28a745' }}></i>
                                        <span className="quiz-stat-value">{score}</span>
                                        <span className="quiz-stat-label">{translations["flashcard.correctUpper"]}</span>
                                    </div>
                                    <div className="quiz-results-stat">
                                        <i className="fas fa-times-circle" style={{ color: '#dc3545' }}></i>
                                        <span className="quiz-stat-value">{questions.length - score}</span>
                                        <span className="quiz-stat-label">{translations["flashcard.incorrectUpper"]}</span>
                                    </div>
                                    <div className="quiz-results-stat">
                                        <i className="fas fa-list" style={{ color: cardColor }}></i>
                                        <span className="quiz-stat-value">{questions.length}</span>
                                        <span className="quiz-stat-label">{translations["flashcard.total"]}</span>
                                    </div>
                                </div>

                                <button
                                    className="quiz-restart-btn"
                                    onClick={handleRestartQuiz}
                                    style={{ backgroundColor: cardColor }}
                                >
                                    <i className="fas fa-redo me-2"></i>
                                    {translations["flashcard.tryAgain"]}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {collections?.length === 0 && (
                <NoDataMessage message="&#128511; You have no collection. Let's start to take note and practice vocabulary." />
            )}
        </div>
    );
};
