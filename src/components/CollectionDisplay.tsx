import { CommonProps } from "../interfaces/props";
import "../App.css";
import { DeleteCollectionModal } from "./Modal/DeleteCollectionModal";

export const CollectionDisplay: React.FC<CommonProps> = ({
    db,
    collections,
    setCollections,
}) => {
    return (
        <div className="collection-list" id="collection-list">
            <h4 className="text-center mt-4">Collections</h4>
            <div className="row">
                {collections && collections.length > 0 ? (
                    collections.map((collection) => (
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
                            <DeleteCollectionModal
                                collection={collection}
                                db={db}
                                setCollections={setCollections}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center">
                        &#128511; Oops...! You have no collection. Let's start to take note and learn vocabulary. 
                    </div>
                )}
            </div>
        </div>
    );
};
