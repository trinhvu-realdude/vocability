import React, { useState } from "react";
import { CollectionCardProps } from "../../interfaces/props";
import { EditCollectionForm } from "../Form/EditCollectionForm";
import { DeleteCollectionForm } from "../Form/DeleteCollectionForm";
import { formatDate } from "../../utils/formatDateString";

export const CollectionCard: React.FC<CollectionCardProps> = ({
    db,
    collection,
    setCollections,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);

    return (
        <div className="col-md-4 mb-4">
            {!isEdit && !isDelete && (
                <div
                    className="card"
                    id="card-collection"
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
                        <div>
                            <div
                                className="btn btn-sm"
                                style={{
                                    border: "none",
                                    color: "#fff",
                                }}
                                onClick={() => setIsEdit(true)}
                            >
                                <i className="fas fa-pen"></i>
                            </div>
                            <div
                                className="btn btn-sm"
                                style={{
                                    border: "none",
                                    color: "#fff",
                                }}
                                onClick={() => setIsDelete(true)}
                            >
                                <i className="fas fa-times"></i>
                            </div>
                        </div>
                    </div>
                    <a
                        className="card-body text-center"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title={`Created at ${formatDate(collection.createdAt)}`}
                        href={`/app/collection/${collection.id}`}
                    >
                        <p>
                            <i className="fas fa-book" /> Number of words:{" "}
                            {collection.numOfWords}
                        </p>
                    </a>
                </div>
            )}

            {isEdit && (
                <EditCollectionForm
                    db={db}
                    collection={collection}
                    setCollections={setCollections}
                    setIsEditOrDelete={setIsEdit}
                />
            )}

            {isDelete && (
                <DeleteCollectionForm
                    db={db}
                    collection={collection}
                    setIsEditOrDelete={setIsDelete}
                    setCollections={setCollections}
                />
            )}
        </div>
    );
};
