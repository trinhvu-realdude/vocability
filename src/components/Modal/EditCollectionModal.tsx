import { useState, useEffect } from "react";
import { CollectionModalProps } from "../../interfaces/mainProps";
import {
    getCollectionById,
    getCollectionsByLanguageId,
    updateCollection,
} from "../../services/CollectionService";
import { useLanguage } from "../../LanguageContext";

export const EditCollectionModal: React.FC<CollectionModalProps> = ({
    db,
    collection,
    setIsEditOrDelete,
    setCollection,
    setCollections,
    onShowToast,
}) => {
    const [renameValue, setRenameValue] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [showModal, setShowModal] = useState(false);

    const { translations } = useLanguage();

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

    const handleEditCollection = async () => {
        try {
            if (db) {
                const updatedCollection = await updateCollection(
                    db,
                    collection,
                    renameValue !== "" ? renameValue.trim() : collection.name,
                    color !== "" ? color : collection.color
                );
                if (updatedCollection) {
                    const storedCollections = await getCollectionsByLanguageId(
                        db,
                        updatedCollection.languageId
                    );
                    setCollections(storedCollections);

                    if (collection.id && setCollection) {
                        const objCollection = await getCollectionById(
                            db,
                            collection.id
                        );
                        setCollection(objCollection);
                    }

                    onShowToast?.(translations["alert.renameCollectionSuccess"], "success");
                    handleClose();
                }
            }
        } catch (error) {
            console.log(error);
            onShowToast?.(translations["alert.renameCollectionFailed"], "error");
        }
    };

    return (
        <div
            className={`modal fade ${showModal ? "show" : ""}`}
            style={{
                display: "block",
                backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
                transition: "background-color 0.15s ease-out",
            }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content word-modal-content">
                    <div
                        className="word-modal-header"
                        style={{
                            backgroundColor: color !== "" ? color : collection.color,
                        }}
                    >
                        <h5 className="word-modal-title">
                            <i className="fas fa-folder-open me-2"></i>
                            {translations["editForm.editCollection"]}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm word-modal-close"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="word-modal-body">
                        <div className="text-center mb-3">
                            <i
                                className="fas fa-folder"
                                style={{
                                    color: color !== "" ? color : collection.color,
                                    fontSize: "4rem"
                                }}
                            ></i>
                        </div>

                        <div className="input-group mb-3">
                            <span className="input-group-text">
                                <i className="fas fa-palette"></i>
                            </span>
                            <input
                                type="color"
                                className="form-control form-control-color"
                                id="color-input"
                                value={color !== "" ? color : collection.color}
                                title="Choose your color"
                                onChange={(event) => setColor(event.target.value)}
                            />
                            <input
                                type="text"
                                className="form-control"
                                defaultValue={collection.name}
                                placeholder={translations["name"]}
                                onChange={(event) => setRenameValue(event.target.value)}
                            />
                        </div>
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
                            className="btn btn-success"
                            onClick={handleEditCollection}
                        >
                            <i className="fas fa-save me-1"></i>
                            {translations["editBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
