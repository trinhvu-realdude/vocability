import { useState } from "react";
import { NoDataMessage } from "../components/NoDataMessage";
import { FlashcardQuizPageProps } from "../interfaces/practiceProps";
import { getWordsByCollectionId } from "../services/WordService";
import { Word } from "../interfaces/model";
import { getCollectionById } from "../services/CollectionService";
import { FlashCard } from "../components/Card/FlashCard";
import "../styles/FlashCard.css";

export const FlashcardQuizPage: React.FC<FlashcardQuizPageProps> = ({
    db,
    collections,
}) => {
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
            const collection = await getCollectionById(
                db,
                selectedCollectionId
            );
            setCardColor(collection ? collection.color : "");
            let words = await getWordsByCollectionId(db, selectedCollectionId);
            // Shuffle the words array
            words = words.sort(() => Math.random() - 0.5);

            // Determine the number of words to return
            const maxWords = Math.min(numberOfCards, words.length, 10);

            console.log(maxWords);

            // Slice the array to get the desired number of words
            const selectedWords = words.slice(0, maxWords);

            setGeneratedWords(selectedWords);
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
            <h4 className="text-center mt-4">Flashcard Quiz</h4>

            {collections && collections.length > 0 ? (
                <div className="input-group mb-4">
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
