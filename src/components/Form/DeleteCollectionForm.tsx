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
        <div className="card" style={{ borderColor: collection.color }}>
            <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{
                    backgroundColor: collection.color,
                    color: "#fff",
                }}
            >
                {translations["deleteForm.deleteCollection"]}
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
                <p>{translations["deleteForm.deleteCollectionText"]}</p>
            </div>

            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    {translations["cancelBtn"]}
                </button>
                <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => handleDeleteCollection(collection)}
                >
                    {translations["deleteBtn"]}
                </button>
            </div>
        </div>
    );
};
