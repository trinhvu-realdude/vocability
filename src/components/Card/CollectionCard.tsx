import React, { useState } from "react";
import { CollectionCardProps } from "../../interfaces/mainProps";
import { EditCollectionForm } from "../Form/EditCollectionForm";
import { DeleteCollectionForm } from "../Form/DeleteCollectionForm";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";

export const CollectionCard: React.FC<CollectionCardProps> = ({
    db,
    collection,
    setCollections,
    languageCode,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);

    const { translations } = useLanguage();

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
                        title={`${translations["createdAt"]} ${formatDate(
                            collection.createdAt,
                            translations["language"]
                        )}`}
                        href={`/${languageCode}/collection/${collection.id}`}
                    >
                        <p>
                            <i className="fas fa-book" />{" "}
                            {
                                translations[
                                    "collectionPage.collectionCard.numberOfWords"
                                ]
                            }
                            : {collection.numOfWords}
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
