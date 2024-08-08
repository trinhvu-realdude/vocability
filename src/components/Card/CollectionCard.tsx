import React from "react";
import { DeleteCollectionModal } from "../Modal/DeleteCollectionModal";
import { CollectionCardProps } from "../../interfaces/props";
import { EditCollectionModal } from "../Modal/EditCollectionModal";

export const CollectionCard: React.FC<CollectionCardProps> = ({
    db,
    collection,
    setCollections,
}) => {
    return (
        <div className="col-md-4 mb-4">
            <div className="card" style={{ borderColor: collection.color }}>
                <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{
                        backgroundColor: collection.color,
                        color: "#fff",
                    }}
                >
                    {collection.name}
                    <div>
                        <div
                            className="btn btn-sm"
                            style={{
                                border: "none",
                                color: "#fff",
                            }}
                            data-bs-toggle="modal"
                            data-bs-target={`#edit-collection-${collection.id}`}
                        >
                            <i className="fas fa-pen"></i>
                        </div>
                        <div
                            className="btn btn-sm"
                            style={{
                                border: "none",
                                color: "#fff",
                            }}
                            data-bs-toggle="modal"
                            data-bs-target={`#collection-${collection.id}`}
                        >
                            <i className="fas fa-times"></i>
                        </div>
                    </div>
                </div>
                <a
                    className="card-body text-center"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title={`Created at ${new Date(
                        collection.createdAt
                    ).toUTCString()}`}
                    href={`/app/collection/${collection.id}`}
                >
                    <p>
                        <i className="fas fa-book" /> Number of words:{" "}
                        {collection.numOfWords}
                    </p>
                </a>
            </div>
            <DeleteCollectionModal
                db={db}
                collection={collection}
                setCollections={setCollections}
            />
            <EditCollectionModal
                db={db}
                collection={collection}
                setCollections={setCollections}
            />
        </div>
    );
};
