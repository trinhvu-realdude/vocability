import { useState } from "react";
import { languages, partsOfSpeech } from "../../utils/constants";
import ReactSelectCreatable from "react-select/creatable";
import { SingleValue } from "react-select";
import {
    addWord,
    getPhonetic,
    getWordsByCollectionId,
} from "../../services/WordService";
import { getCurrentLanguageId, getRandomColor } from "../../utils/helper";
import { Choice, CommonProps } from "../../interfaces/mainProps";
import { getCollectionsByLanguageId } from "../../services/CollectionService";
import { useLanguage } from "../../LanguageContext";

export const AddWordForm: React.FC<CommonProps> = ({
    db,
    collections,
    collectionId,
    setCollections,
    setWords,
}) => {
    const [word, setWord] = useState<string>("");
    const [definition, setDefinition] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const [choice, setChoice] = useState<SingleValue<Object>>();

    const { translations } = useLanguage();

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
                    color: getRandomColor(),
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
                    definition: definition.trim(),
                    notes: notes.trim(),
                    partOfSpeech: partOfSpeech,
                    isFavorite: false,
                    createdAt: new Date(),
                };
                const addedWord = await addWord(db, objWord, objCollection);

                const storedCollections = await getCollectionsByLanguageId(
                    db,
                    currentLanguageId
                );
                setCollections(storedCollections);

                setWord("");
                setPartOfSpeech("");
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
                alert(`Word ${addedWord.word} has been added successfully`);
            } else {
                alert("Please choose or create the collection first");
            }
        } catch (error) {
            console.log(error);
            alert(`Failed to add ${word}`);
        }
    };

    return (
        <div className="form-add-word">
            <div className="input-group mb-2">
                <select
                    className="form-select"
                    id="part-of-speech"
                    value={partOfSpeech}
                    onChange={(event) => setPartOfSpeech(event.target.value)}
                >
                    <option value="">
                        {translations["addWordForm.partOfSpeech"]}
                    </option>
                    {selectedPartsOfSpeech &&
                        selectedPartsOfSpeech["list"].map(
                            (partOfSpeech, index) => (
                                <option key={index} value={partOfSpeech.value}>
                                    {partOfSpeech.label}
                                </option>
                            )
                        )}
                </select>

                <input
                    type="text"
                    className="form-control"
                    placeholder={translations["addWordForm.noteYourWord"]}
                    value={word}
                    onChange={(event) => setWord(event.target.value)}
                />
            </div>
            {word.length > 1 && partOfSpeech ? (
                <div className="row">
                    <div className="input-group col-12 mb-2">
                        <ReactSelectCreatable
                            className="react-select-creatable"
                            placeholder={translations["addWordForm.collection"]}
                            value={choice}
                            options={collections.map((collection) => {
                                return {
                                    label: collection.name,
                                    value: collection.name,
                                };
                            })}
                            noOptionsMessage={() =>
                                translations["addWordForm.noOptionsMessage"]
                            }
                            onChange={(choice) => setChoice(choice)}
                            styles={{
                                menu: (provided: any) => ({
                                    ...provided,
                                    zIndex: 1050, // High z-index to ensure it's on top
                                }),
                            }}
                        />
                    </div>
                    <div className="input-group col-12 mb-2">
                        <span className="input-group-text">
                            {translations["addWordForm.definition"]}
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            onChange={(event) =>
                                setDefinition(event.target.value)
                            }
                        />
                    </div>
                    <div className="input-group col-12 mb-2">
                        <span className="input-group-text">
                            {translations["addWordForm.notes"]}
                        </span>
                        <textarea
                            className="form-control"
                            onChange={(event) => setNotes(event.target.value)}
                        ></textarea>
                    </div>
                    <div className="d-flex input-group col-12">
                        <button
                            className="btn btn-outline-success"
                            onClick={handleAddWord}
                            style={{ width: "100%" }}
                        >
                            {translations["addWordForm.addWordBtn"]}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
