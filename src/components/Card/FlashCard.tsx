import { useState } from "react";
import { Word } from "../../interfaces/model";
import { getHintWord } from "../../utils/helper";

export const FlashCard: React.FC<{
    index: number;
    word: Word;
    isFlipped: boolean;
    isGetHint: boolean;
    cardColor: string;
    setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
    setIsGetHint: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
    index,
    word,
    isFlipped,
    isGetHint,
    cardColor,
    setIsFlipped,
    setIsGetHint,
}) => {
    const [hint, setHint] = useState<string>("");

    const handleGetHint = async () => {
        setIsGetHint(true);
        const hintWord = await getHintWord(word.word);
        setHint(hintWord);
    };

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
                                <small>{word.phonetic}</small>
                                <br />
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
            {!isFlipped && !isGetHint && (
                <div
                    className="get-hint text-center mt-4"
                    onClick={handleGetHint}
                >
                    <i className="fa" style={{ color: "yellowgreen" }}>
                        &#xf0eb;
                    </i>{" "}
                    Get a hint
                </div>
            )}
            {isGetHint && !isFlipped && (
                <div className="text-center mt-4">
                    <strong>{hint}</strong>{" "}
                    <small>
                        <i>({word.partOfSpeech})</i>
                    </small>
                </div>
            )}
            {isFlipped && (
                <div
                    className="text-center mt-4"
                    style={{ cursor: "pointer" }}
                    // onClick={() => handleTextToSpeech(word.word)}
                >
                    <strong>{word.word}</strong>{" "}
                    <small>
                        <i>({word.partOfSpeech})</i>
                    </small>
                </div>
            )}
        </div>
    );
};
