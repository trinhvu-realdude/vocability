import { Word } from "../../interfaces/model";
import { WordFormProps } from "../../interfaces/mainProps";
import { deleteWord, getWordsByCollectionId } from "../../services/WordService";
import { useLanguage } from "../../LanguageContext";
import "../../styles/AddWordModal.css";

export const DeleteWordForm: React.FC<WordFormProps> = ({
    db,
    word,
    setIsEditOrDelete,
    setWords,
}) => {
    const { translations } = useLanguage();

    const handleDeleteWord = async (wordData: Word) => {
        if (db) {
            await deleteWord(db, wordData);
            if (wordData.collectionId) {
                const objWord = await getWordsByCollectionId(
                    db,
                    wordData.collectionId
                );
                setWords(objWord);
            }
            alert(translations["alert.deleteWordSuccess"]);
        }
    };
    return (
        <div className="card word-modal-content" style={{ borderColor: "#dc3545" }}>
            <div
                className="word-modal-header"
                style={{
                    backgroundColor: "#dc3545",
                }}
            >
                <h5 className="word-modal-title">
                    <i className="fas fa-trash-alt me-2"></i>
                    {translations["deleteForm.deleteWord"]}
                </h5>
                <button
                    type="button"
                    className="btn btn-sm word-modal-close"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="word-modal-body text-center">
                <div className="mb-3">
                    <i className="fas fa-exclamation-triangle" style={{ color: "#dc3545", fontSize: "3rem" }}></i>
                </div>
                <p>{translations["deleteForm.deleteWordText"]}</p>
            </div>

            <div className="word-modal-footer">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    <i className="fas fa-times me-1"></i>
                    {translations["cancelBtn"]}
                </button>
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteWord(word)}
                >
                    <i className="fas fa-trash-alt me-1"></i>
                    {translations["deleteBtn"]}
                </button>
            </div>
        </div>
    );
};
