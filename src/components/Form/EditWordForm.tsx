import { useRef, useState } from "react";
import { EditWordObj, WordFormProps } from "../../interfaces/mainProps";
import { partsOfSpeech } from "../../utils/constants";
import {
    getPhonetic,
    getWordsByCollectionId,
    updateWord,
} from "../../services/WordService";
import { useLanguage } from "../../LanguageContext";
import { Definition } from "../../interfaces/model";
import { validateInputs } from "../../utils/helper";
import "../../styles/AddWordModal.css";

export const EditWordForm: React.FC<WordFormProps> = ({
    db,
    word,
    collection,
    setIsEditOrDelete,
    setWords,
    setWord,
    onShowToast,
}) => {
    const [partOfSpeechValue, setPartOfSpeechValue] = useState<string>(word.partOfSpeech || "");
    const [wordValue, setWordValue] = useState<string>(word.word || "");
    // Create a deep copy of definitions to avoid mutating the original word object
    const [definitions, setDefinitions] = useState<Definition[]>(
        word.definitions && word.definitions.length > 0
            ? JSON.parse(JSON.stringify(word.definitions))
            : [{ definition: "", notes: "" }]
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { translations } = useLanguage();

    const selectedPartsOfSpeech = partsOfSpeech.find(
        (language) => language.code === translations["language"]
    );

    const [errors, setErrors] = useState<{
        word?: string;
        partOfSpeech?: string;
        collection?: string;
        definitions?: { [index: number]: string };
    }>({});

    const closeBtnRef = useRef<HTMLButtonElement>(null);

    const handleEditWord = async () => {
        const wordEdit = wordValue.trim();
        const partOfSpeechEdit = partOfSpeechValue.trim();
        const definitionsEdit = definitions;
        if (!validateInputs(wordEdit, partOfSpeechEdit, collection, definitionsEdit, setErrors)) return;

        setIsLoading(true);
        let phonetic;
        if (translations["language"] === "us") {
            phonetic = await getPhonetic(wordEdit);
        }
        try {
            if (db) {
                const editValue: EditWordObj = {
                    word: wordEdit,
                    phonetic: phonetic,
                    partOfSpeech: partOfSpeechEdit,
                    definitions: definitionsEdit,
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

                // Close form first
                setIsEditOrDelete(false);
                closeBtnRef.current?.click();

                // Show success toast after form closes
                setTimeout(() => {
                    onShowToast?.(
                        translations["alert.editWordSuccess"] || "Word updated successfully!",
                        "success"
                    );
                }, 300);
            }
        } catch (error) {
            console.log(error);
            onShowToast?.(
                translations["alert.editWordFailed"],
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

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
        if (errors.definitions && errors.definitions[index]) {
            const newErrors = { ...errors };
            if (newErrors.definitions) {
                delete newErrors.definitions[index];
                if (Object.keys(newErrors.definitions).length === 0) {
                    delete newErrors.definitions;
                }
            }
            setErrors(newErrors);
        }
    };

    const handleNotesChange = (index: number, value: string) => {
        const updated = [...definitions];
        updated[index].notes = value;
        setDefinitions(updated);
    };

    return (
        <div className="card word-modal-content" style={{ borderColor: collection?.color }}>
            <div
                className="word-modal-header"
                style={{
                    backgroundColor: collection?.color,
                }}
            >
                <h5 className="word-modal-title">
                    <i className="fas fa-edit me-2"></i>
                    {translations["editForm.editWord"]}
                </h5>
                <button
                    type="button"
                    className="btn btn-sm word-modal-close"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="word-modal-body">
                <div className="mb-2">
                    <div className="row g-2">
                        <div className="col">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={translations["addWordForm.noteYourWord"]}
                                value={wordValue}
                                onChange={(event) => {
                                    setWordValue(event.target.value);
                                    if (errors.word) {
                                        setErrors({ ...errors, word: undefined });
                                    }
                                }}
                            />
                        </div>

                        <div className="col">
                            <select
                                className="form-select"
                                id="part-of-speech"
                                value={partOfSpeechValue}
                                onChange={(event) => {
                                    setPartOfSpeechValue(event.target.value);
                                    if (errors.partOfSpeech) {
                                        setErrors({
                                            ...errors,
                                            partOfSpeech: undefined,
                                        });
                                    }
                                }}
                            >
                                <option value="">{translations["addWordForm.partOfSpeech"]}</option>
                                {selectedPartsOfSpeech &&
                                    selectedPartsOfSpeech.list.map(
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
                    </div>

                    <div className="row g-2">
                        <div className="col">
                            {errors.word && (
                                <div className="text-danger small">{errors.word}</div>
                            )}
                        </div>

                        <div className="col">
                            {errors.partOfSpeech && (
                                <div className="text-danger small">
                                    {errors.partOfSpeech}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="row">
                    {/* Multiple definitions view */}
                    {definitions &&
                        definitions.map((def, index) => (
                            <div key={index}>
                                <div className="mb-2">
                                    <div className="input-group col-12">
                                        <span className="input-group-text">
                                            {translations["addWordForm.definition"]}
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={def.definition}
                                            onChange={(event) =>
                                                handleDefinitionChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    {errors.definitions && errors.definitions[index] && (
                                        <div className="text-danger small">
                                            {errors.definitions[index]}
                                        </div>
                                    )}
                                </div>
                                <div className="input-group col-12 mb-2">
                                    <span className="input-group-text">
                                        {translations["addWordForm.notes"]}
                                    </span>
                                    <textarea
                                        className="form-control"
                                        value={def.notes}
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

                <div className="definition-controls">
                    <button
                        type="button"
                        className="btn btn-definition-add"
                        onClick={handleAddDefinitionRow}
                        title="Add definition"
                    >
                        <i className="fas fa-plus"></i>
                    </button>
                    <button
                        type="button"
                        className="btn btn-definition-remove"
                        onClick={handleRemoveDefinitionRow}
                        disabled={definitions.length <= 1}
                        title="Remove definition"
                    >
                        <i className="fas fa-minus"></i>
                    </button>
                </div>
            </div>

            <div className="word-modal-footer">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    ref={closeBtnRef}
                    onClick={() => setIsEditOrDelete(false)}
                    disabled={isLoading}
                >
                    <i className="fas fa-times me-1"></i>
                    {translations["cancelBtn"]}
                </button>
                <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleEditWord}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin me-1"></i>
                            {translations["loading"] || "Saving..."}
                        </>
                    ) : (
                        <>
                            <i className="fas fa-save me-1"></i>
                            {translations["editBtn"]}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
