import { useState } from "react";
import { CollectionFormProps } from "../../interfaces/mainProps";
import {
    getCollectionById,
    getCollections,
    updateCollection,
} from "../../services/CollectionService";

export const EditCollectionForm: React.FC<CollectionFormProps> = ({
    db,
    collection,
    setIsEditOrDelete,
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
                setIsEditOrDelete(false);
            }
        } catch (error) {
            console.log(error);
            alert(`Failed to rename ${collection.name}`);
        }
    };

    return (
        <div className="card" style={{ borderColor: collection.color }}>
            <div
                className="card-header d-flex justify-content-between align-items-center"
                style={{
                    backgroundColor: color !== "" ? color : collection.color,
                    color: "#fff",
                }}
            >
                Edit collection
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

            <div className="card-body">
                <div className="input-group mb-2">
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
                        onChange={(event) => setRenameValue(event.target.value)}
                    />
                </div>
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
                    className="btn btn-outline-success"
                    onClick={handleEditCollection}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};
