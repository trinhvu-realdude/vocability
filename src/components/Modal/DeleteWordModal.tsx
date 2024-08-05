import { Word } from "../../interfaces/model";
import { WordModalProps } from "../../interfaces/props";
import { deleteWord, getWordsByCollectionId } from "../../services/WordService";

export const DeleteWordModal: React.FC<WordModalProps> = ({
    db,
    word,
    collection,
    setWords,
}) => {
    const handleDeleteWord = async (word: Word) => {
        if (db) {
            await deleteWord(db, word);
            if (word.collectionId) {
                const objWord = await getWordsByCollectionId(
                    db,
                    word.collectionId
                );
                setWords(objWord);
            }
            alert(`Deleted ${word.word} successfully`);
        }
    };

    return (
        <div
            className="modal fade"
            id={`delete-word-${word.id}`}
            tabIndex={-1}
            aria-labelledby={`#delete-word-${word.id}`}
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div
                        className="modal-header"
                        style={{
                            backgroundColor: collection?.color,
                            color: "#fff",
                        }}
                    >
                        <h5
                            className="modal-title"
                            id={`delete-word-${word.id}`}
                        >
                            Delete word
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
                        <h5>
                            Are you sure to delete{" "}
                            <span>
                                <strong>{word.word}</strong>
                            </span>{" "}
                            from{" "}
                            <span style={{ color: collection?.color }}>
                                {collection?.name}
                            </span>{" "}
                            collection?
                        </h5>
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
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteWord(word)}
                            data-bs-dismiss="modal"
                        >
                            Delete now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
