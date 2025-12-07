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
import "../../styles/AddWordModal.css";

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
        <div className="card word-modal-content" style={{ borderColor: "#dc3545" }}>
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
                    onClick={() => setIsEditOrDelete(false)}
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
    );
};
