import { WordModalProps } from "../../interfaces/props";
import { partsOfSpeech } from "../../utils/constants";

export const EditWordModal: React.FC<WordModalProps> = ({
    db,
    word,
    collection,
    setWords,
}) => {
    const handleEditWord = async () => {
        console.log(word);
    };

    return (
        <div
            className="modal fade"
            id={`edit-word-${word.id}`}
            tabIndex={-1}
            aria-labelledby={`#edit-word-${word.id}`}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div
                        className="modal-header"
                        style={{
                            backgroundColor: collection?.color,
                            color: "#fff",
                        }}
                    >
                        <h5 className="modal-title" id={`edit-word-${word.id}`}>
                            Edit word
                        </h5>
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
                    <div className="modal-body text-center">
                        <div className="input-group mb-2">
                            <select
                                className="form-select"
                                id="part-of-speech"
                                defaultValue={word.partOfSpeech}
                            >
                                <option value="">Part of speech</option>
                                {partsOfSpeech &&
                                    partsOfSpeech.map((partOfSpeech, index) => (
                                        <option
                                            key={index}
                                            value={partOfSpeech.value}
                                        >
                                            {partOfSpeech.label}
                                        </option>
                                    ))}
                            </select>

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Add a word"
                                defaultValue={word.word}
                                onChange={(event) =>
                                    (word.word = event.target.value)
                                }
                            />
                        </div>
                        <div className="row">
                            <div className="input-group col-12 mb-2">
                                <span className="input-group-text">
                                    Definition
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={word.definition}
                                    onChange={(event) =>
                                        (word.definition = event.target.value)
                                    }
                                />
                            </div>
                            <div className="input-group col-12 mb-2">
                                <span className="input-group-text">Notes</span>
                                <textarea
                                    className="form-control"
                                    defaultValue={word.notes}
                                    onChange={(event) =>
                                        (word.notes = event.target.value)
                                    }
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={handleEditWord}
                            data-bs-dismiss="modal"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
