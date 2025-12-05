import { useState, useRef } from "react";
import { Choice, CommonProps } from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";
import ReactSelectCreatable from "react-select/creatable";
import {
    getCurrentLanguageId,
    getRandomColor,
    reorderActiveLanguages,
    validateInputs,
} from "../../utils/helper";
import { Definition } from "../../interfaces/model";
import { SingleValue } from "react-select";
import { languages, partsOfSpeech } from "../../utils/constants";
import {
    addWord,
    getPhonetic,
    getWordsByCollectionId,
} from "../../services/WordService";
import {
    getActiveLanguages,
    getCollectionsByLanguageId,
} from "../../services/CollectionService";

export const AddWordModal: React.FC<CommonProps> = ({
    db,
    collections,
    collectionId,
    setCollections,
    setWords,
}) => {
    const { translations, setActiveLanguages } = useLanguage();
    const [randomColor, setRandomColor] = useState<string>(getRandomColor());
    const [word, setWord] = useState<string>("");
    const [definitions, setDefinitions] = useState<Definition[]>([
        { definition: "", notes: "" }, // default 1 set
    ]);
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const [choice, setChoice] = useState<SingleValue<Object>>();

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

    const handleAddWord = async () => {
        if (!validateInputs(word, partOfSpeech, choice, definitions, setErrors)) return;
        try {
            const collection = choice as Choice;

            if (db && collection) {
                const currentLanguageId = await getCurrentLanguageId(
                    languages,
                    translations["language"]
                );

                const objCollection = {
                    name: collection.value,
                    color: randomColor,
                    createdAt: new Date(),
                    languageId: currentLanguageId ? currentLanguageId : -1,
                };

                let phonetic;
                if (currentLanguageId === 1) {
                    phonetic = await getPhonetic(word.toLowerCase().trim());
                }

                const objWord = {
                    word: word.toLowerCase().trim(),
                    phonetic: phonetic && phonetic,
                    definitions: definitions,
                    partOfSpeech: partOfSpeech,
                    isFavorite: false,
                    createdAt: new Date(),
                };
                const addedWord = await addWord(
                    db,
                    objWord,
                    objCollection,
                    currentLanguageId
                );

                const storedCollections = await getCollectionsByLanguageId(
                    db,
                    currentLanguageId
                );

                const activeLanguages = await getActiveLanguages(db);
                const reorderedLanguages = reorderActiveLanguages(
                    activeLanguages,
                    translations["language"]
                );
                setActiveLanguages(reorderedLanguages);
                setCollections(storedCollections);

                setWord("");
                setPartOfSpeech("");
                setDefinitions([{ definition: "", notes: "" }]);
                setChoice(undefined);

                if (
                    addedWord.collectionId &&
                    collectionId &&
                    addedWord.collectionId === Number.parseInt(collectionId)
                ) {
                    const words = await getWordsByCollectionId(
                        db,
                        addedWord.collectionId
                    );
                    setWords(words);
                }
                alert(translations["alert.addWordSuccess"]);
                closeBtnRef.current?.click();
            } else {
                alert(translations["alert.validateCollectionEmpty"]);
            }
        } catch (error) {
            console.log(error);
            alert(translations["alert.addWordFailed"]);
        }
    };

    const handleAddDefinitionRow = () => {
        setDefinitions([...definitions, { definition: "", notes: "" }]);
    };

    const handleRemoveDefinitionRow = () => {
        if (definitions.length > 1) {
            setDefinitions(definitions.slice(0, -1)); // remove last row
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

    const handleClose = () => {
        setWord("");
        setPartOfSpeech("");
        setDefinitions([{ definition: "", notes: "" }]);
        setChoice(undefined);
        setErrors({});
    };

    return (
        <div
            className="modal fade"
            id="add-word"
            tabIndex={-1}
            aria-labelledby="#add-word"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content word-modal-content">
                    <div
                        className="word-modal-header"
                        style={{
                            backgroundColor: randomColor,
                        }}
                    >
                        <h5 className="word-modal-title">
                            <i className="fas fa-book-medical me-2"></i>
                            {translations["addWordForm.addWordBtn"]}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm word-modal-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            ref={closeBtnRef}
                            onClick={handleClose}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="word-modal-body">
                        <div className="mb-2">
                            {/* Row 1: inputs */}
                            <div className="row g-2">
                                <div className="col">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={translations["addWordForm.noteYourWord"]}
                                        value={word}
                                        onChange={(event) => {
                                            setWord(event.target.value);
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
                                        value={partOfSpeech}
                                        onChange={(event) => {
                                            setPartOfSpeech(event.target.value);
                                            if (errors.partOfSpeech) {
                                                setErrors({
                                                    ...errors,
                                                    partOfSpeech: undefined,
                                                });
                                            }
                                        }}
                                    >
                                        <option value="">
                                            {translations["addWordForm.partOfSpeech"]}
                                        </option>
                                        {selectedPartsOfSpeech &&
                                            selectedPartsOfSpeech.list.map((pos, index) => (
                                                <option key={index} value={pos.value}>
                                                    {pos.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: error messages */}
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
                            <div className="input-group col-12 mb-2">
                                <ReactSelectCreatable
                                    className="react-select-creatable"
                                    placeholder={
                                        translations["addWordForm.collection"]
                                    }
                                    value={choice}
                                    options={collections.map((collection) => {
                                        return {
                                            label: collection.name,
                                            value: collection.name,
                                            color: collection.color,
                                        };
                                    })}
                                    noOptionsMessage={() =>
                                        translations[
                                        "addWordForm.noOptionsMessage"
                                        ]
                                    }
                                    onChange={(choice: any) => {
                                        setChoice(choice);
                                        if (errors.collection) {
                                            setErrors({
                                                ...errors,
                                                collection: undefined,
                                            });
                                        }
                                        // update modal header color instantly
                                        if (choice?.color) {
                                            setRandomColor(choice.color);
                                        } else {
                                            setRandomColor(getRandomColor());
                                        }
                                    }}
                                    styles={{
                                        menu: (provided: any) => ({
                                            ...provided,
                                            zIndex: 1050, // High z-index to ensure it's on top
                                        }),
                                    }}
                                />
                                {errors.collection && (
                                    <div className="text-danger small">
                                        {errors.collection}
                                    </div>
                                )}
                            </div>
                            {definitions.map((def, index) => (
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
                                                    handleDefinitionChange(index, event.target.value)
                                                }
                                            />
                                        </div>

                                        {/* Error row */}
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
                                        index < definitions.length - 1 && (
                                            <hr />
                                        )}
                                </div>
                            ))}
                            <div className="d-flex justify-content-center align-items-center input-group">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary mb-2"
                                    onClick={handleAddDefinitionRow}
                                >
                                    <b>+</b>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary mb-2"
                                    onClick={handleRemoveDefinitionRow}
                                >
                                    <b>-</b>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="word-modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                            ref={closeBtnRef}
                            onClick={handleClose}
                        >
                            <i className="fas fa-times me-1"></i>
                            {translations["cancelBtn"]}
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleAddWord}
                        >
                            <i className="fas fa-plus me-1"></i>
                            {translations["addWordForm.addWordBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
