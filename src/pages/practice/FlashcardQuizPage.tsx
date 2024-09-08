import { useState } from "react";
import { NoDataMessage } from "../../components/NoDataMessage";
import { FlashcardQuizPageProps } from "../../interfaces/practiceProps";
import { Word } from "../../interfaces/model";
import { FlashCard } from "../../components/Card/FlashCard";
import "../../styles/FlashCard.css";
import { PageHeader } from "../../components/PageHeader";
import { APP_NAME } from "../../utils/constants";
import { generateWordsForFlashCards } from "../../services/PracticeService";
import { PracticeMessage } from "../../components/PracticeMessage";

export const FlashcardQuizPage: React.FC<FlashcardQuizPageProps> = ({
    db,
    collections,
}) => {
    document.title = `${APP_NAME} | Flashcard Quiz`;

    const [selectedCollectionId, setSelectedCollectionId] = useState<number>();
    const [numberOfCards, setNumberOfCards] = useState<number>();
    const [generatedWords, setGeneratedWords] = useState<Word[]>([]);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isGetHint, setIsGetHint] = useState<boolean>(false);
    const [cardColor, setCardColor] = useState<string>("");
    const [currentIndex, setCurrentIndex] = useState(1);

    const handleGenerateFlashcard = async () => {
        setIsFlipped(false);
        setIsGetHint(false);
        setCurrentIndex(1);
        if (db && selectedCollectionId && numberOfCards) {
            const wordsForFlashCards = await generateWordsForFlashCards(
                db,
                selectedCollectionId,
                numberOfCards,
                setCardColor
            );
            if (wordsForFlashCards.length > 0) {
                setGeneratedWords(wordsForFlashCards);
            } else {
                alert("Collection has no word");
            }
        } else {
            alert("Please choose the collection and enter number of cards");
        }
    };

    const handleSlide = (direction: string) => {
        setIsGetHint(false);
        setIsFlipped(false);

        setCurrentIndex((prevIndex) => {
            if (direction === "next") {
                return prevIndex === generatedWords.length ? 1 : prevIndex + 1;
            } else {
                return prevIndex === 1 ? generatedWords.length : prevIndex - 1;
            }
        });
    };

    return (
        <div className="container-list" id="flashcard-quiz">
            <PageHeader
                href="/practices"
                content={
                    <>
                        <span style={{ color: cardColor && cardColor }}>
                            Flashcard
                        </span>{" "}
                        Quiz
                    </>
                }
            />

            {collections && collections.length > 0 ? (
                <>
                    <div className="input-group my-4">
                        <select
                            className="form-select"
                            id="part-of-speech"
                            onChange={(event) =>
                                setSelectedCollectionId(
                                    Number.parseInt(event.target.value)
                                )
                            }
                        >
                            <option value="">Collection</option>
                            {collections.map((collection, index) => (
                                <option key={index} value={collection.id}>
                                    {collection.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            className="form-control"
                            placeholder="Number of cards"
                            min={2}
                            onChange={(event) =>
                                setNumberOfCards(
                                    Number.parseInt(event.target.value)
                                )
                            }
                        />
                        <button
                            className="btn btn-outline-success"
                            onClick={handleGenerateFlashcard}
                        >
                            Generate
                        </button>
                    </div>

                    {!generatedWords ||
                        (generatedWords.length <= 0 && (
                            <PracticeMessage message="📚 Choose the collection, enter number of cards and enjoy flashcards" />
                        ))}
                </>
            ) : (
                <NoDataMessage message="&#128511; You have no collection. Let's start to take note and practice vocabulary." />
            )}

            {generatedWords && generatedWords.length > 0 && (
                <div
                    id="flashcard-carousel"
                    className="carousel carousel-dark slide"
                    data-bs-interval="false"
                >
                    <div className="carousel-inner">
                        {generatedWords.map((word, index) => (
                            <FlashCard
                                key={index}
                                index={index}
                                word={word}
                                cardColor={cardColor}
                                isFlipped={isFlipped}
                                isGetHint={isGetHint}
                                setIsFlipped={setIsFlipped}
                                setIsGetHint={setIsGetHint}
                            />
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <span
                            className="p-1"
                            style={{
                                border: "1px solid gray",
                                borderRadius: "0.25rem",
                            }}
                        >
                            <small>
                                {currentIndex}/{generatedWords.length}
                            </small>
                        </span>
                    </div>

                    <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#flashcard-carousel"
                        data-bs-slide="prev"
                        onClick={() => handleSlide("prev")}
                    >
                        <span
                            className="carousel-control-prev-icon"
                            aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#flashcard-carousel"
                        data-bs-slide="next"
                        onClick={() => handleSlide("next")}
                    >
                        <span
                            className="carousel-control-next-icon"
                            aria-hidden="true"
                        ></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            )}
        </div>
    );
};
