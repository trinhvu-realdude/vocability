import { Collection } from "../../interfaces/model";
import { CollectionFormProps } from "../../interfaces/mainProps";
import {
    deleteCollection,
    getActiveLanguages,
    getCollectionsByLanguageId,
} from "../../services/CollectionService";
import { getCurrentLanguageId } from "../../utils/helper";
import { languages } from "../../utils/constants";
import { useLanguage } from "../../LanguageContext";

export const DeleteCollectionForm: React.FC<CollectionFormProps> = ({
    db,
    collection,
    setIsEditOrDelete,
    setCollections,
}) => {
    const { translations, setActiveLanguages } = useLanguage();

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
            alert(translations["alert.deleteCollectionSuccess"]);
        }
    };

    return (
        <div className="folder-delete-form">
            {/* Folder Tab Header */}
            <div
                className="folder-form-tab"
                style={{
                    backgroundColor: "#dc3545",
                }}
            >
                <div className="folder-form-tab-content">
                    <i className="fas fa-trash-alt me-2"></i>
                    <span>{translations["deleteForm.deleteCollection"]}</span>
                </div>
                <button
                    className="folder-form-close-btn"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Folder Body */}
            <div
                className="folder-form-body"
                style={{
                    borderColor: "#dc3545",
                }}
            >
                {/* Warning Icon */}
                <div className="folder-delete-preview">
                    <i
                        className="fas fa-folder-open"
                        style={{ color: collection.color }}
                    ></i>
                    <div className="delete-warning-badge">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                </div>

                {/* Delete Message */}
                <div className="folder-delete-message">
                    <p className="delete-collection-name">
                        <i className="fas fa-folder me-2" style={{ color: collection.color }}></i>
                        <strong>{collection.name}</strong>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="folder-form-actions">
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
                        onClick={() => handleDeleteCollection(collection)}
                    >
                        <i className="fas fa-trash-alt me-1"></i>
                        {translations["deleteBtn"]}
                    </button>
                </div>
            </div>
        </div>
    );
};
