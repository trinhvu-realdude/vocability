import { useState } from "react";
import { partsOfSpeech } from "../../utils/constants";
import ReactSelectCreatable from "react-select/creatable";
import { SingleValue } from "react-select";
import { addWord, getWordsByCollectionId } from "../../services/WordService";
import { getRandomColor } from "../../utils/helper";
import { Choice, CommonProps } from "../../interfaces/props";
import { getCollections } from "../../services/CollectionService";

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

    const handleAddWord = async () => {
        try {
            const collection = choice as Choice;
            if (db) {
                const objCollection = {
                    name: collection.value,
                    color: getRandomColor(),
                    createdAt: new Date(),
                };
                const objWord = {
                    word: word.toLowerCase().trim(),
                    definition: definition.trim(),
                    notes: notes.trim(),
                    partOfSpeech: partOfSpeech,
                    isFavorite: false,
                    createdAt: new Date(),
                };
                const addedWord = await addWord(db, objWord, objCollection);

                const storedCollections = await getCollections(db);
                setCollections(storedCollections);

                setWord("");
                setPartOfSpeech("");

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
                    onChange={(event) => setPartOfSpeech(event.target.value)}
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
                    placeholder="Note your word"
                    onChange={(event) => setWord(event.target.value)}
                />
            </div>
            {word.length > 1 && partOfSpeech ? (
                <div className="row">
                    <div className="input-group col-12 mb-2">
                        <ReactSelectCreatable
                            className="react-select-creatable"
                            placeholder="Collection"
                            options={collections.map((collection) => {
                                return {
                                    label: collection.name,
                                    value: collection.name,
                                };
                            })}
                            noOptionsMessage={() => "No collections"}
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
                        <span className="input-group-text">Definition</span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder=""
                            onChange={(event) =>
                                setDefinition(event.target.value)
                            }
                        />
                    </div>
                    <div className="input-group col-12 mb-2">
                        <span className="input-group-text">Notes</span>
                        <textarea
                            className="form-control"
                            onChange={(event) => setNotes(event.target.value)}
                        ></textarea>
                    </div>
                    <div className="input-group col-12">
                        <button
                            className="btn btn-success"
                            onClick={handleAddWord}
                            style={{ width: "100%" }}
                        >
                            Add Word
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
