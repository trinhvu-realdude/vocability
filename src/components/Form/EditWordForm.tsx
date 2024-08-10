import { useState } from "react";
import { EditWordObj, WordFormProps } from "../../interfaces/props";
import { partsOfSpeech } from "../../utils/constants";
import { getWordsByCollectionId, updateWord } from "../../services/WordService";

export const EditWordForm: React.FC<WordFormProps> = ({
    db,
    word,
    collection,
    setIsEditOrDelete,
    setWords,
}) => {
    const [partOfSpeechValue, setPartOfSpeechValue] = useState<string>("");
    const [wordValue, setWordValue] = useState<string>("");
    const [definitionValue, setDefinitionValue] = useState<string>("");
    const [notesValue, setNotesValue] = useState<string>("");

    const handleEditWord = async () => {
        try {
            if (db) {
                const editValue: EditWordObj = {
                    word: wordValue !== "" ? wordValue.trim() : word.word,
                    partOfSpeech:
                        partOfSpeechValue !== ""
                            ? partOfSpeechValue.trim()
                            : word.partOfSpeech,
                    definition:
                        definitionValue !== ""
                            ? definitionValue.trim()
                            : word.definition,
                    notes: notesValue !== "" ? notesValue.trim() : word.notes,
                };
                const updatedWord = await updateWord(db, word, editValue);

                if (updatedWord && collection?.id) {
                    const words = await getWordsByCollectionId(
                        db,
                        collection.id
                    );
                    setWords(words);
                }
                setIsEditOrDelete(false);
            }
        } catch (error) {
            console.log(error);
            alert(`Failed to edit ${word.word}`);
        }
    };

    return (
        <div className="card">
            <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{
                    backgroundColor: collection?.color,
                    color: "#fff",
                }}
            >
                Edit word
                <div>
                    <div
                        className="btn btn-sm"
                        style={{
                            border: "none",
                            color: "#fff",
                        }}
                        onClick={() => setIsEditOrDelete(false)}
                    >
                        <i className="fas fa-times"></i>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div className="input-group mb-2">
                    <select
                        className="form-select"
                        id="part-of-speech"
                        defaultValue={word.partOfSpeech}
                        onChange={(event) =>
                            setPartOfSpeechValue(event.target.value)
                        }
                    >
                        <option value="">Part of speech</option>
                        {partsOfSpeech &&
                            partsOfSpeech.map((partOfSpeech, index) => (
                                <option key={index} value={partOfSpeech.value}>
                                    {partOfSpeech.label}
                                </option>
                            ))}
                    </select>

                    <input
                        type="text"
                        className="form-control"
                        placeholder="Add a word"
                        defaultValue={word.word}
                        onChange={(event) => setWordValue(event.target.value)}
                    />
                </div>
                <div className="row">
                    <div className="input-group col-12 mb-2">
                        <span className="input-group-text">Definition</span>
                        <input
                            type="text"
                            className="form-control"
                            defaultValue={word.definition}
                            onChange={(event) =>
                                setDefinitionValue(event.target.value)
                            }
                        />
                    </div>
                    <div className="input-group col-12 mb-2">
                        <span className="input-group-text">Notes</span>
                        <textarea
                            className="form-control"
                            defaultValue={word.notes}
                            onChange={(event) =>
                                setNotesValue(event.target.value)
                            }
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleEditWord}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};
