import { useState } from "react";
import { EditWordObj, WordFormProps } from "../../interfaces/mainProps";
import { partsOfSpeech } from "../../utils/constants";
import {
    getPhonetic,
    getWordsByCollectionId,
    updateWord,
} from "../../services/WordService";
import { useLanguage } from "../../LanguageContext";
import { Definition } from "../../interfaces/model";

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
    const [definitions, setDefinitions] = useState<Definition[]>(() => {
        if (word.definitions && word.definitions.length > 0) {
            return word.definitions;
        }

        if (word.definition || word.notes) {
            return [
                {
                    definition: word.definition,
                    notes: word.notes,
                },
            ];
        }

        return [{ definition: "", notes: "" }];
    });

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
                    definitions: definitions,
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

    console.log(word);
    

    const handleAddDefinitionRow = () => {
        setDefinitions([...definitions, { definition: "", notes: "" }]);
    };

    const handleRemoveDefinitionRow = () => {
        if (definitions.length > 1) {
            setDefinitions(definitions.slice(0, -1));
        }
    };

    const handleDefinitionChange = (index: number, value: string) => {
        const updated = [...definitions];
        updated[index].definition = value;
        setDefinitions(updated);
    };

    const handleNotesChange = (index: number, value: string) => {
        const updated = [...definitions];
        updated[index].notes = value;
        setDefinitions(updated);
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
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Add a word"
                        defaultValue={word.word}
                        onChange={(event) => setWordValue(event.target.value)}
                    />
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
                </div>
                <div className="row">
                    {/* Multiple definitions view */}
                    {definitions &&
                        definitions.map((def, index) => (
                            <div key={index}>
                                <div className="input-group col-12 mb-2">
                                    <span className="input-group-text">
                                        {translations["addWordForm.definition"]}
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue={def.definition}
                                        onChange={(event) =>
                                            handleDefinitionChange(
                                                index,
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="input-group col-12 mb-2">
                                    <span className="input-group-text">
                                        {translations["addWordForm.notes"]}
                                    </span>
                                    <textarea
                                        className="form-control"
                                        defaultValue={def.notes}
                                        onChange={(event) =>
                                            handleNotesChange(
                                                index,
                                                event.target.value
                                            )
                                        }
                                    ></textarea>
                                </div>
                                {definitions.length > 1 &&
                                    index < definitions.length - 1 && <hr />}
                            </div>
                        ))}
                </div>

                <div className="d-flex justify-content-center align-items-center input-group">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleAddDefinitionRow}
                    >
                        <b>+</b>
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleRemoveDefinitionRow}
                    >
                        <b>-</b>
                    </button>
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
