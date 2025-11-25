import { useState } from "react";
import { Choice, CommonProps } from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";
import ReactSelectCreatable from "react-select/creatable";
import {
    getCurrentLanguageId,
    getRandomColor,
    reorderActiveLanguages,
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

    const handleAddWord = async () => {
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
                    definition: "",
                    notes: "",
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
    };

    const handleNotesChange = (index: number, value: string) => {
        const updated = [...definitions];
        updated[index].notes = value;
        setDefinitions(updated);
    };

    return (
        <div
            className="modal fade"
            id="add-word"
            tabIndex={-1}
            aria-labelledby="#add-word"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div
                        className="modal-header"
                        style={{
                            backgroundColor: randomColor,
                            color: "#fff",
                        }}
                    >
                        <h5 className="modal-title">Add new word</h5>
                        <button
                            type="button"
                            className="btn btn-sm"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            style={{ border: "none", color: "#fff" }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="input-group mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={
                                    translations["addWordForm.noteYourWord"]
                                }
                                value={word}
                                onChange={(event) =>
                                    setWord(event.target.value)
                                }
                            />
                            <select
                                className="form-select"
                                id="part-of-speech"
                                value={partOfSpeech}
                                onChange={(event) =>
                                    setPartOfSpeech(event.target.value)
                                }
                            >
                                <option value="">
                                    {translations["addWordForm.partOfSpeech"]}
                                </option>
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
                            </div>
                            {definitions.map((def, index) => (
                                <div key={index}>
                                    <div className="input-group col-12 mb-2">
                                        <span className="input-group-text">
                                            {
                                                translations[
                                                    "addWordForm.definition"
                                                ]
                                            }
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
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                            onClick={() => {
                                setWord("");
                                setPartOfSpeech("");
                                setDefinitions([{ definition: "", notes: "" }]);
                                setChoice(undefined);
                            }}
                        >
                            {translations["cancelBtn"]}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={handleAddWord}
                            data-bs-dismiss="modal"
                        >
                            {translations["addWordForm.addWordBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
