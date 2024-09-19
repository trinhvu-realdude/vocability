import { useState } from "react";
import { EditWordObj, WordFormProps } from "../../interfaces/mainProps";
import { partsOfSpeech } from "../../utils/constants";
import {
    getPhonetic,
    getWordsByCollectionId,
    updateWord,
} from "../../services/WordService";
import { useLanguage } from "../../LanguageContext";

export const EditWordForm: React.FC<WordFormProps> = ({
    db,
    word,
    collection,
    setIsEditOrDelete,
    setWords,
    setWord,
}) => {
    const [partOfSpeechValue, setPartOfSpeechValue] = useState<string>("");
    const [wordValue, setWordValue] = useState<string>("");
    const [definitionValue, setDefinitionValue] = useState<string>("");
    const [notesValue, setNotesValue] = useState<string>("");

    const { translations } = useLanguage();

    const selectedPartsOfSpeech = partsOfSpeech.find(
        (language) => language.code === translations["language"]
    );

    const handleEditWord = async () => {
        let phonetic;
        if (translations["language"] === "us") {
            phonetic = await getPhonetic(
                wordValue !== "" ? wordValue.trim() : word.word
            );
        }
        try {
            if (db) {
                const editValue: EditWordObj = {
                    word: wordValue !== "" ? wordValue.trim() : word.word,
                    phonetic: phonetic,
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
                if (setWord) setWord(updatedWord);
                setIsEditOrDelete(false);
            }
        } catch (error) {
            console.log(error);
            alert(translations["alert.editWordFailed"]);
        }
    };

    return (
        <div className="card" style={{ borderColor: collection?.color }}>
            <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{
                    backgroundColor: collection?.color,
                    color: "#fff",
                }}
            >
                {translations["editForm.editWord"]}
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
                        {selectedPartsOfSpeech &&
                            selectedPartsOfSpeech["list"].map(
                                (partOfSpeech, index) => (
                                    <option
                                        key={index}
                                        value={partOfSpeech.value}
                                    >
                                        {partOfSpeech.label}
                                    </option>
                                )
                            )}
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
                        <span className="input-group-text">
                            {translations["addWordForm.definition"]}
                        </span>
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
                        <span className="input-group-text">
                            {translations["addWordForm.notes"]}
                        </span>
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
                    {translations["cancelBtn"]}
                </button>
                <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={handleEditWord}
                >
                    {translations["editBtn"]}
                </button>
            </div>
        </div>
    );
};
