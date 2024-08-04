import { CommonProps, DeleteModalComponentProps } from "../interfaces/type";
import "../App.css";
import { deleteCollection } from "../services/CollectionService";
import { Collection } from "../interfaces/interface";

const DeleteModalComponent: React.FC<DeleteModalComponentProps> = ({
    db,
    collection,
}) => {
    const handleDeleteCollection = async (collection: Collection) => {
        if (db) {
            await deleteCollection(db, collection);
            alert(`Deleted the collection ${collection.name} successfully`);
            window.location.reload();
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
                            Delete {collection.name}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-light"
                            data-bs-dismiss="modal"
                            aria-label="Close"
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
                        >
                            Delete now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CollectionDisplay: React.FC<CommonProps> = ({
    db,
    collections,
}) => {
    return (
        <div className="collection-list" id="collection-list">
            <h4 className="text-center mt-4">Collections</h4>
            <div className="row">
                {collections.map((collection) => (
                    <div key={collection.id} className="col-md-4 mb-4">
                        <div
                            className="card"
                            style={{ borderColor: collection.color }}
                        >
                            <div
                                className="card-header d-flex justify-content-between align-items-center"
                                style={{
                                    backgroundColor: collection.color,
                                    color: "#fff",
                                }}
                            >
                                {collection.name}
                                <button
                                    className="btn btn-sm"
                                    style={{
                                        border: "none",
                                        color: "#fff",
                                    }}
                                    data-bs-toggle="modal"
                                    data-bs-target={`#collection-${collection.id}`}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <a
                                className="card-body text-center"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title={`Created at ${new Date(
                                    collection.createdAt
                                ).toUTCString()}`}
                                href={`/collection/${collection.id}`}
                            >
                                <p>
                                    <i className="fas fa-book" /> Number of
                                    words: {collection.numOfWords}
                                </p>
                            </a>
                        </div>
                        <DeleteModalComponent collection={collection} db={db} />
                    </div>
                ))}
            </div>
        </div>
    );
};
