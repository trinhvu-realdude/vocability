import { Collection } from "../../interfaces/model";
import { CollectionCardProps } from "../../interfaces/props";
import {
    deleteCollection,
    getCollections,
} from "../../services/CollectionService";

export const DeleteCollectionModal: React.FC<CollectionCardProps> = ({
    db,
    collection,
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
        <div
            className="modal fade"
            id={`collection-${collection.id}`}
            tabIndex={-1}
            aria-labelledby={`#collection-${collection.id}`}
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div
                        className="modal-header"
                        style={{
                            backgroundColor: collection.color,
                            color: "#fff",
                        }}
                    >
                        <h5
                            className="modal-title"
                            id={`collection-${collection.id}`}
                        >
                            Delete{" "}
                            <span>
                                <strong>{collection.name}</strong>
                            </span>
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-light"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            style={{ border: "none", color: "#fff" }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="modal-body text-center">
                        <h5>
                            Are you sure you want to delete this collection?
                        </h5>
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
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteCollection(collection)}
                            data-bs-dismiss="modal"
                        >
                            Delete now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
