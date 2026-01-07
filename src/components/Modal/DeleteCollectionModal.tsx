import { useState, useEffect } from "react";
import { Collection } from "../../interfaces/model";
import { CollectionModalProps } from "../../interfaces/mainProps";
import {
    deleteCollection,
    getActiveLanguages,
    getCollectionsByLanguageId,
} from "../../services/CollectionService";
import { getCurrentLanguageId } from "../../utils/helper";
import { languages } from "../../utils/constants";
import { useLanguage } from "../../LanguageContext";
import "../../styles/AddWordModal.css";

export const DeleteCollectionModal: React.FC<CollectionModalProps> = ({
    db,
    collection,
    setIsEditOrDelete,
    setCollections,
    onShowToast,
}) => {
    const { translations, setActiveLanguages } = useLanguage();
    const [showModal, setShowModal] = useState(false);

    // Trigger animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setShowModal(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setTimeout(() => {
            if (setIsEditOrDelete) {
                setIsEditOrDelete(false);
            }
        }, 150);
    };

    const handleDeleteCollection = async (collection: Collection) => {
        if (db) {
            await deleteCollection(db, collection);
            const currentLanguageId = await getCurrentLanguageId(
                languages,
                translations["language"]
            );
            const storedCollections = await getCollectionsByLanguageId(
                db,
                currentLanguageId
            );
            const activeLanguages = await getActiveLanguages(db);
            setCollections(storedCollections);
            setActiveLanguages(activeLanguages);
            console.log(onShowToast);

            onShowToast?.(
                translations["alert.deleteCollectionSuccess"],
                "success"
            );
            handleClose();
        }
    };

    return (
        <div
            className={`modal fade ${showModal ? 'show' : ''}`}
            style={{
                display: 'block',
                backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
                transition: 'background-color 0.15s ease-out'
            }}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
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
                            {translations["deleteForm.deleteCollection"]}
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
                            <i
                                className="fas fa-folder"
                                style={{
                                    color: collection.color,
                                    fontSize: "4rem"
                                }}
                            ></i>
                            <div className="mt-2">
                                <i className="fas fa-exclamation-triangle" style={{ color: "#dc3545", fontSize: "2rem" }}></i>
                            </div>
                        </div>

                        <p className="mb-0">
                            <i className="fas fa-folder me-2" style={{ color: collection.color }}></i>
                            <strong>{collection.name}</strong>
                        </p>
                    </div>

                    <div className="word-modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={handleClose}
                        >
                            <i className="fas fa-times me-1"></i>
                            {translations["cancelBtn"]}
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => handleDeleteCollection(collection)}
                        >
                            <i className="fas fa-trash-alt me-1"></i>
                            {translations["deleteBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
