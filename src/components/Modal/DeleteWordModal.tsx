import { useState } from "react";
import { Word } from "../../interfaces/model";
import { WordFormProps } from "../../interfaces/mainProps";
import { deleteWord, getWordsByCollectionId } from "../../services/WordService";
import { useLanguage } from "../../LanguageContext";
import "../../styles/AddWordModal.css";

export const DeleteWordModal: React.FC<WordFormProps> = ({
    db,
    word,
    setIsEditOrDelete,
    setWords,
    onShowToast,
}) => {
    const { translations } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteWord = async (wordData: Word) => {
        setIsLoading(true);
        try {
            if (db) {
                await deleteWord(db, wordData);
                if (wordData.collectionId) {
                    const objWord = await getWordsByCollectionId(
                        db,
                        wordData.collectionId
                    );
                    setWords(objWord);
                }

                // Close form first
                setShowModal(false);
                setTimeout(() => setIsEditOrDelete(false), 150);

                // Show success toast after form closes
                onShowToast?.(
                    translations["alert.deleteWordSuccess"],
                    "success"
                );
            }
        } catch (error) {
            console.log(error);
            onShowToast?.(
                translations["alert.deleteWordFailed"] || "Failed to delete word",
                "error"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const [showModal, setShowModal] = useState(false);

    // Trigger animation on mount
    useState(() => {
        setTimeout(() => setShowModal(true), 10);
    });

    const handleClose = () => {
        setShowModal(false);
        setTimeout(() => setIsEditOrDelete(false), 150);
    };

    return (
        <div
            className={`modal fade ${showModal ? 'show' : ''}`}
            style={{ display: 'block', backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)' }}
            tabIndex={-1}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content word-modal-content">
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
                            onClick={handleClose}
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
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            <i className="fas fa-times me-1"></i>
                            {translations["cancelBtn"]}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDeleteWord(word)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-1"></i>
                                    {translations["loading"] || "Deleting..."}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-trash-alt me-1"></i>
                                    {translations["deleteBtn"]}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
