import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { NoDataMessage } from "../../components/NoDataMessage";
import { FlashcardQuizPageProps } from "../../interfaces/practiceProps";
import { Word } from "../../interfaces/model";
import { FlashCard } from "../../components/Card/FlashCard";
import "../../styles/FlashCard.css";
import "../../styles/ReviewModal.css"; // Reuse some review modal styles for layout
import { PageHeader } from "../../components/PageHeader";
import { APP_NAME } from "../../utils/constants";
import { generateWordsForFlashCards } from "../../services/PracticeService";
import { useLanguage } from "../../LanguageContext";
import { handleTextToSpeech } from "../../utils/helper";

export const FlashcardQuizPage: React.FC<FlashcardQuizPageProps> = ({
    db,
    collections,
}) => {
    const { translations } = useLanguage();
    document.title = `Flashcard Quiz | ${APP_NAME}`;

    const [searchParams] = useSearchParams();
    const collectionIdParam = searchParams.get("collectionId");

    const [generatedWords, setGeneratedWords] = useState<Word[]>([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [cardColor, setCardColor] = useState<string>("#6c757d");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isQuizStarted, setIsQuizStarted] = useState(false);

    useEffect(() => {
        if (collectionIdParam && db) {
            handleStartQuiz(Number(collectionIdParam));
        }
    }, [collectionIdParam, db]);

    const handleStartQuiz = async (collectionId: number) => {
        const count = 1000; // Default to all as requested (removed number input)

        if (db) {
            const wordsForFlashCards = await generateWordsForFlashCards(
                db,
                collectionId,
                count,
                setCardColor
            );
            if (wordsForFlashCards.length > 0) {
                setGeneratedWords(wordsForFlashCards);
                setIsQuizStarted(true);
                setCurrentIndex(0);
                setIsFlipped(false);
            } else {
                // alert("Collection has no words to practice");
                setIsQuizStarted(false);
            }
        }
    };

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex < generatedWords.length - 1) {
                setCurrentIndex(prev => prev + 1);
            }
        }, 200);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            }
        }, 200);
    };

    const currentWord = generatedWords[currentIndex];
    const progress = ((currentIndex + 1) / generatedWords.length) * 100;

    return (
        <div className="container-list" id="flashcard-quiz">
            <PageHeader content={translations["practice.flashcard"]} />

            {isQuizStarted && (
                /* Quiz View */
                <div className="container-fluid p-0 mt-4">
                    {/* Progress Bar */}
                    <div className="review-progress mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="review-progress-text">
                            <span>{translations["review.card"]} {currentIndex + 1} {translations["review.of"]} {generatedWords.length}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="review-progress-bar-container">
                            <div
                                className="review-progress-bar"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
                                }}
                            ></div>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <FlashCard
                                word={currentWord}
                                isFlipped={isFlipped}
                                onFlip={() => {
                                    handleTextToSpeech(currentWord.word, translations["languageVoice"]);
                                    setIsFlipped(!isFlipped)
                                }}
                                cardColor={cardColor}
                            />

                            <div className="d-flex justify-content-center align-items-center mt-5 gap-4">
                                <button
                                    className="gototop"
                                    onClick={handlePrev}
                                    disabled={currentIndex === 0}
                                    title="Previous"
                                    style={{
                                        visibility: 'visible',
                                        position: 'static',
                                        width: "35px",
                                        height: "35px",
                                        fontSize: '1.2rem',
                                        opacity: currentIndex === 0 ? 0.5 : 1
                                    }}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>

                                <button
                                    className="gototop"
                                    onClick={handleNext}
                                    disabled={currentIndex === generatedWords.length - 1}
                                    title="Next"
                                    style={{
                                        visibility: 'visible',
                                        position: 'static',
                                        width: "35px",
                                        height: "35px",
                                        fontSize: '1.2rem',
                                        opacity: currentIndex === generatedWords.length - 1 ? 0.5 : 1
                                    }}
                                >
                                    <i className="fas fa-chevron-right"></i>
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
