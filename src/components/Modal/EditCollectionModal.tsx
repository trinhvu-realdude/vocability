import { useState } from "react";
import { CollectionModalProps } from "../../interfaces/props";
import {
    getCollectionById,
    getCollections,
    updateCollection,
} from "../../services/CollectionService";

export const EditCollectionModal: React.FC<CollectionModalProps> = ({
    db,
    collection,
    setCollection,
    setCollections,
}) => {
    const [renameValue, setRenameValue] = useState<string>("");
    const [color, setColor] = useState<string>("");

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
                    const storedCollections = await getCollections(db);
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
            alert(`Failed to rename ${collection.name}`);
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
                            backgroundColor: collection?.color,
                            color: "#fff",
                        }}
                    >
                        <h5
                            className="modal-title"
                            id={`edit-collection-${collection.id}`}
                        >
                            Edit collection
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
                                defaultValue={collection.color}
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
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={handleEditCollection}
                            data-bs-dismiss="modal"
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
