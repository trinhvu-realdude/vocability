import { useState } from "react";
import { partsOfSpeech } from "../utils/constants";
import ReactSelectCreatable from "react-select/creatable";
import { SingleValue } from "react-select";
import { addWord } from "../services/WordService";
import { getRandomColor } from "../utils/helper";
import { Choice, CommonProps } from "../interfaces/type";

export const AddWordForm: React.FC<CommonProps> = ({ db, collections }) => {
    const [word, setWord] = useState<string>("");
    const [definition, setDefinition] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const [choice, setChoice] = useState<SingleValue<Object>>();

    const handleAddWord = async () => {
        const collection = choice as Choice;
        if (db) {
            const objCollection = {
                name: collection.value,
                color: getRandomColor(),
                createdAt: new Date(),
            };
            const objWord = {
                word: word,
                definition: definition,
                notes: notes,
                partOfSpeech: partOfSpeech,
            };
            await addWord(db, objWord, objCollection);

            alert(`Word ${word} has been added successfully`);
        }
        setWord("");
        setPartOfSpeech("");
        window.location.reload();
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
                    placeholder="Add a word"
                    onChange={(event) =>
                        setWord(event.target.value.toLowerCase().trim())
                    }
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
