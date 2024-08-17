import { Word } from "../../interfaces/model";
import { WordFormProps } from "../../interfaces/mainProps";
import { deleteWord, getWordsByCollectionId } from "../../services/WordService";

export const DeleteWordForm: React.FC<WordFormProps> = ({
    db,
    word,
    collection,
    setIsEditOrDelete,
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
        <div className="card" style={{ borderColor: collection?.color }}>
            <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{
                    backgroundColor: collection?.color,
                    color: "#fff",
                }}
            >
                Delete word
                <div>
                    <div
                        className="btn btn-sm"
                        style={{
                            border: "none",
                            color: "#fff",
                        }}
                        onClick={() => setIsEditOrDelete(false)}
                    >
                        <i className="fas fa-times"></i>
                    </div>
                </div>
            </div>

            <div className="card-body text-center">
                <p>
                    Are you sure to delete{" "}
                    <span>
                        <strong>{word.word}</strong>
                    </span>{" "}
                    from{" "}
                    <span style={{ color: collection?.color }}>
                        {collection?.name}
                    </span>{" "}
                    collection?
                </p>
            </div>

            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleDeleteWord(word)}
                >
                    Delete now
                </button>
            </div>
        </div>
    );
};
