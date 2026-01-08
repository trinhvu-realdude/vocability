import React from "react";
import ReactSelectCreatable from "react-select/creatable";
import { Definition } from "../../interfaces/model";

interface AddWordFormProps {
    word: string;
    setWord: (val: string) => void;
    partOfSpeech: string;
    setPartOfSpeech: (val: string) => void;
    definitions: Definition[];
    choice: any;
    setChoice: (val: any) => void;
    collections: any[];
    translations: any;
    errors: any;
    setErrors: (val: any) => void;
    setRandomColor: (val: string) => void;
    getRandomColor: () => string;
    selectedPartsOfSpeech: any;
    handleDefinitionChange: (index: number, value: string) => void;
    handleNotesChange: (index: number, value: string) => void;
    handleAddDefinitionRow: () => void;
    handleRemoveDefinitionRow: () => void;
}

export const AddWordForm: React.FC<AddWordFormProps> = ({
    word,
    setWord,
    partOfSpeech,
    setPartOfSpeech,
    definitions,
    choice,
    setChoice,
    collections,
    translations,
    errors,
    setErrors,
    setRandomColor,
    getRandomColor,
    selectedPartsOfSpeech,
    handleDefinitionChange,
    handleNotesChange,
    handleAddDefinitionRow,
    handleRemoveDefinitionRow,
}) => {
    return (
        <>
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
                                selectedPartsOfSpeech.list.map((pos: any, index: number) => (
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
        </>
    );
};
