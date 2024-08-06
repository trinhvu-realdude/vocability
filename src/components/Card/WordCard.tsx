import React from "react";
import { WordCardProps } from "../../interfaces/props";
import { DeleteWordModal } from "../Modal/DeleteWordModal";
import { EditWordModal } from "../Modal/EditWordModal";

export const WordCard: React.FC<WordCardProps> = ({
    db,
    word,
    collection,
    setWords,
}) => {
    const handleTextToSpeech = async (text: string) => {
        const speech = new SpeechSynthesisUtterance();
        speech.text = text;
        window.speechSynthesis.speak(speech);

        // check voice speech for each language
        window.speechSynthesis.onvoiceschanged = () => {
            console.log(window.speechSynthesis.getVoices());
        };
    };

    return (
        <div className="list-group-item">
            <div className="d-flex w-100 justify-content-between mb-2">
                <div className="row">
                    <h5 className="mb-1">
                        <strong>{word.word}</strong>{" "}
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                margin: 0,
                                font: "inherit",
                                color: "inherit",
                                cursor: "pointer",
                            }}
                            onClick={() => handleTextToSpeech(word.word)}
                        >
                            <i
                                className="fas fa-volume-up"
                                style={{
                                    fontSize: "12px",
                                }}
                            ></i>
                        </button>
                    </h5>
                    <small>
                        <i>{word.partOfSpeech}</i>
                    </small>
                </div>
                <div>
                    <button
                        className="btn btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target={`#edit-word-${word.id}`}
                    >
                        <i
                            className="fas fa-pen"
                            style={{
                                fontSize: "12px",
                            }}
                        ></i>
                    </button>
                    <button
                        className="btn btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target={`#delete-word-${word.id}`}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <p className="mb-1">{word.definition}</p>
            {word.notes && (
                <p className="mb-1">
                    <strong>Notes:</strong> {word.notes}
                </p>
            )}
            <DeleteWordModal
                db={db}
                word={word}
                collection={collection}
                setWords={setWords}
            />
            <EditWordModal
                db={db}
                word={word}
                collection={collection}
                setWords={setWords}
            />
        </div>
    );
};
