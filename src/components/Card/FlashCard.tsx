import { Word } from "../../interfaces/model";

export const FlashCard: React.FC<{
    index: number;
    word: Word;
    isFlipped: boolean;
    cardColor: string;
    setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ index, word, isFlipped, cardColor, setIsFlipped }) => {
    return (
        <div
            key={word.id}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
        >
            <div
                className={`flashcard ${isFlipped ? "flip" : ""}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className="flashcard-inner">
                    <div
                        className="card flashcard-front"
                        style={{ borderColor: cardColor }}
                    >
                        <div
                            className="card-header w-100"
                            style={{
                                backgroundColor: cardColor,
                                color: "#fff",
                            }}
                        >
                            Definition
                        </div>
                        <div
                            className="card-body w-100 mb-4 d-flex justify-content-center align-items-center"
                            style={{ backgroundColor: "#fff" }}
                        >
                            <div className="definition p-4">
                                {word.definition}
                            </div>
                        </div>
                    </div>
                    <div
                        className="card flashcard-back"
                        style={{ borderColor: cardColor }}
                    >
                        <div
                            className="card-header w-100"
                            style={{
                                backgroundColor: cardColor,
                                color: "#fff",
                            }}
                        >
                            Word
                        </div>
                        <div className="card-body w-100 mb-4 d-flex justify-content-center align-items-center">
                            <div className="word">
                                {word.word}
                                <br />
                                <small>
                                    <i>({word.partOfSpeech})</i>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
