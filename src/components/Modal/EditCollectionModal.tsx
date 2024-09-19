import { useState } from "react";
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
    setCollection,
    setCollections,
}) => {
    const [renameValue, setRenameValue] = useState<string>("");
    const [color, setColor] = useState<string>("");

    const { translations } = useLanguage();

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
                }
            }
        } catch (error) {
            console.log(error);
            alert(translations["alert.renameCollectionFailed"]);
        }
    };
    return (
        <div
            className="modal fade"
            id={`edit-collection-${collection.id}`}
            tabIndex={-1}
            aria-labelledby={`#edit-collection-${collection.id}`}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-sm">
                <div className="modal-content">
                    <div
                        className="modal-header"
                        style={{
                            backgroundColor:
                                color !== "" ? color : collection.color,
                            color: "#fff",
                        }}
                    >
                        <h5
                            className="modal-title"
                            id={`edit-collection-${collection.id}`}
                        >
                            {translations["editForm.editCollection"]}
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
                            <input
                                type="color"
                                className="form-control form-control-color"
                                id="color-input"
                                value={color !== "" ? color : collection.color}
                                title="Choose your color"
                                onChange={(event) =>
                                    setColor(event.target.value)
                                }
                            />
                            <input
                                type="text"
                                className="form-control"
                                defaultValue={collection.name}
                                onChange={(event) =>
                                    setRenameValue(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            {translations["cancelBtn"]}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={handleEditCollection}
                            data-bs-dismiss="modal"
                        >
                            {translations["editBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
