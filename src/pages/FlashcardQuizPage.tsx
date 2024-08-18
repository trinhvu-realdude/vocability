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
    const [cardColor, setCardColor] = useState<string>("");

    const handleGenerateFlashcard = async () => {
        setIsFlipped(false);
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

            // Slice the array to get the desired number of words
            const selectedWords = words.slice(0, maxWords);

            setGeneratedWords(selectedWords);
        } else {
            alert("Please choose the collection and enter number of cards");
        }
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
                        min={1}
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
                    id="carouselExampleDark"
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
                                setIsFlipped={setIsFlipped}
                            />
                        ))}
                    </div>
                    <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#carouselExampleDark"
                        data-bs-slide="prev"
                        onClick={() => setIsFlipped(false)}
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
                        data-bs-target="#carouselExampleDark"
                        data-bs-slide="next"
                        onClick={() => setIsFlipped(false)}
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
