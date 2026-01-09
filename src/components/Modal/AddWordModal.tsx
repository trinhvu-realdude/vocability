import { useState, useRef, useEffect } from "react";
import { Choice, CommonProps } from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";
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
import { AddWordForm } from "../Form/AddWordForm";
import { ImportSetForm } from "../Form/ImportSetForm";
import "../../styles/AddWordModal.css";

export const AddWordModal: React.FC<CommonProps> = ({
    db,
    collections,
    collectionId,
    setCollections,
    setWords,
    modalId = "add-word",
    initialWord = "",
    onShowToast,
}) => {
    const { translations, setActiveLanguages } = useLanguage();
    const [randomColor, setRandomColor] = useState<string>(getRandomColor());
    const [word, setWord] = useState<string>(initialWord);
    const [definitions, setDefinitions] = useState<Definition[]>([
        { definition: "", notes: "" }, // default 1 set
    ]);
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const [choice, setChoice] = useState<SingleValue<Object>>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isImportMode, setIsImportMode] = useState<boolean>(false);
    const [importText, setImportText] = useState<string>("");
    const [importList, setImportList] = useState<{ word: string, definition: string }[]>([]);
    // Sync choice with collectionId when it changes or when collections change
    useEffect(() => {
        if (typeof collectionId === 'string' && collectionId.trim() !== '') {
            const currentCollection = collections.find(
                (c) => c.id === Number.parseInt(collectionId)
            );
            if (currentCollection) {
                setChoice({
                    label: currentCollection.name,
                    value: currentCollection.name,
                    color: currentCollection.color,
                });
                setRandomColor(currentCollection.color);
            }
        } else {
            setChoice(undefined);
            setRandomColor(getRandomColor());
        }
    }, [collectionId, collections]);

    // Sync initialWord with local state when it changes
    useEffect(() => {
        if (initialWord) {
            setWord(initialWord);
        }
    }, [initialWord]);

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
        if (!isImportMode) {
            if (!validateInputs(word, partOfSpeech, choice, definitions, setErrors)) return;
        } else {
            if (importList.length === 0) {
                onShowToast?.(translations["importSetForm.enterSomeWords"], "warning");
                return;
            }
        }

        setIsLoading(true);
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

                const activeLanguages = await getActiveLanguages(db);
                const reorderedLanguages = reorderActiveLanguages(
                    activeLanguages,
                    translations["language"]
                );

                if (!isImportMode) {
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
                } else {
                    // Batch Import
                    for (const item of importList) {
                        if (!item.word.trim()) continue;

                        let phonetic;
                        if (currentLanguageId === 1) {
                            phonetic = await getPhonetic(item.word.toLowerCase().trim());
                        }

                        const objWord = {
                            word: item.word.toLowerCase().trim(),
                            phonetic: phonetic && phonetic,
                            definitions: [{ definition: item.definition.trim(), notes: "" }],
                            partOfSpeech: "", // Default part of speech for batch import
                            isFavorite: false,
                            createdAt: new Date(),
                        };
                        await addWord(db, objWord, objCollection, currentLanguageId);
                    }

                    // Refresh collections if we are on collections page
                    const updatedCollections = await getCollectionsByLanguageId(db, currentLanguageId);
                    setCollections(updatedCollections);

                    // Refresh words if we are in a collection
                    if (collectionId) {
                        const words = await getWordsByCollectionId(db, Number.parseInt(collectionId));
                        setWords(words);
                    }
                }

                setActiveLanguages(reorderedLanguages);
                const storedCollections = await getCollectionsByLanguageId(
                    db,
                    currentLanguageId
                );
                setCollections(storedCollections);

                // Close modal first
                closeBtnRef.current?.click();

                // Show success toast after modal closes
                onShowToast?.(
                    isImportMode ? "Import successful!" : translations["alert.addWordSuccess"],
                    "success"
                );
            } else {
                onShowToast?.(
                    translations["alert.validateCollectionEmpty"],
                    "warning"
                );
            }
        } catch (error) {
            console.log(error);
            onShowToast?.(
                translations["alert.addWordFailed"],
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleParseImport = () => {
        const lines = importText.split("\n");
        const parsed = lines
            .map((line) => {
                // Regex to split by multiple spaces, tab, colon, or hyphen
                const parts = line.split(/[:\-\t]|\s{2,}/);
                if (parts.length >= 2) {
                    return {
                        word: parts[0].trim(),
                        definition: parts.slice(1).join(" ").trim(),
                    };
                } else if (line.trim()) {
                    return {
                        word: line.trim(),
                        definition: "",
                    };
                }
                return null;
            })
            .filter((item): item is { word: string; definition: string } => item !== null);

        setImportList(parsed);
    };

    const handleImportListChange = (index: number, field: "word" | "definition", value: string) => {
        const newList = [...importList];
        newList[index][field] = value;
        setImportList(newList);
    };

    const handleRemoveImportItem = (index: number) => {
        setImportList(importList.filter((_, i) => i !== index));
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
        setErrors({});
        setIsLoading(false);
        setImportText("");
        setImportList([]);
        setIsImportMode(false);
        if (typeof collectionId === 'string' && collectionId.trim() !== '') {
            const currentCollection = collections.find(
                (c) => c.id === Number.parseInt(collectionId)
            );
            if (currentCollection) {
                setChoice({
                    label: currentCollection.name,
                    value: currentCollection.name,
                    color: currentCollection.color,
                });
                setRandomColor(currentCollection.color);
            } else {
                setChoice(undefined);
                setRandomColor(getRandomColor());
            }
        } else {
            setChoice(undefined);
            setRandomColor(getRandomColor());
        }
    };

    return (
        <div
            className="modal fade"
            id={modalId}
            tabIndex={-1}
            aria-labelledby={modalId}
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
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddWord();
                        }}
                    >
                        <div className="word-modal-body">
                            {/* Tab Toggle */}
                            <div className="import-mode-toggle mb-4">
                                <button
                                    type="button"
                                    className={`btn btn-toggle ${!isImportMode ? "active" : ""}`}
                                    onClick={() => setIsImportMode(false)}
                                >
                                    <i className="fas fa-plus-circle me-1"></i>
                                    {translations["addWordForm.singleWord"]}
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-toggle ${isImportMode ? "active" : ""}`}
                                    onClick={() => setIsImportMode(true)}
                                >
                                    <i className="fas fa-file-import me-1"></i>
                                    {translations["addWordForm.importSet"]}
                                </button>
                            </div>

                            {!isImportMode ? (
                                <AddWordForm
                                    word={word}
                                    setWord={setWord}
                                    partOfSpeech={partOfSpeech}
                                    setPartOfSpeech={setPartOfSpeech}
                                    definitions={definitions}
                                    choice={choice}
                                    setChoice={setChoice}
                                    collections={collections}
                                    translations={translations}
                                    errors={errors}
                                    setErrors={setErrors}
                                    setRandomColor={setRandomColor}
                                    getRandomColor={getRandomColor}
                                    selectedPartsOfSpeech={selectedPartsOfSpeech}
                                    handleDefinitionChange={handleDefinitionChange}
                                    handleNotesChange={handleNotesChange}
                                    handleAddDefinitionRow={handleAddDefinitionRow}
                                    handleRemoveDefinitionRow={handleRemoveDefinitionRow}
                                />
                            ) : (
                                <ImportSetForm
                                    translations={translations}
                                    choice={choice}
                                    setChoice={setChoice}
                                    collections={collections}
                                    errors={errors}
                                    setErrors={setErrors}
                                    setRandomColor={setRandomColor}
                                    getRandomColor={getRandomColor}
                                    importText={importText}
                                    setImportText={setImportText}
                                    handleParseImport={handleParseImport}
                                    importList={importList}
                                    setImportList={setImportList}
                                    handleImportListChange={handleImportListChange}
                                    handleRemoveImportItem={handleRemoveImportItem}
                                />
                            )}
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
                                type="submit"
                                className="btn btn-success"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin me-1"></i>
                                        {translations["loading"] || "Loading..."}
                                    </>
                                ) : (
                                    <>
                                        <i className={`${isImportMode ? "fas fa-file-import" : "fas fa-plus"} me-1`}></i>
                                        {isImportMode ? translations["addWordForm.importSet"] : translations["addWordForm.addWordBtn"]}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
