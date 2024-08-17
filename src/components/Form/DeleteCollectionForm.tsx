import { Collection } from "../../interfaces/model";
import { CollectionFormProps } from "../../interfaces/mainProps";
import {
    deleteCollection,
    getCollections,
} from "../../services/CollectionService";

export const DeleteCollectionForm: React.FC<CollectionFormProps> = ({
    db,
    collection,
    setIsEditOrDelete,
    setCollections,
}) => {
    const handleDeleteCollection = async (collection: Collection) => {
        if (db) {
            await deleteCollection(db, collection);
            const storedCollections = await getCollections(db);
            setCollections(storedCollections);
            alert(`Deleted ${collection.name} collection successfully`);
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
                Delete collection
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
                <p>Are you sure you want to delete this collection?</p>
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
                    className="btn btn-outline-danger"
                    onClick={() => handleDeleteCollection(collection)}
                >
                    Delete now
                </button>
            </div>
        </div>
    );
};
