import React, { useState } from "react";
import { CollectionCardProps } from "../../interfaces/mainProps";
import { EditCollectionForm } from "../Form/EditCollectionForm";
import { DeleteCollectionForm } from "../Form/DeleteCollectionForm";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";
import "../../styles/CollectionCard.css"

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
                <div className="folder-card">
                    {/* Folder Tab */}
                    <div
                        className="folder-tab"
                        style={{
                            backgroundColor: collection.color,
                        }}
                    >
                        <span className="folder-tab-name">
                            {collection.name}
                        </span>
                    </div>

                    {/* Folder Body */}
                    <div
                        className="folder-body"
                        style={{
                            borderColor: collection.color,
                        }}
                    >
                        {/* Action Buttons */}
                        <div className="folder-actions">
                            <div
                                className="btn btn-sm folder-action-btn"
                                onClick={() => setIsEdit(true)}
                                title="Edit"
                            >
                                <i className="fas fa-pen"></i>
                            </div>
                            <div
                                className="btn btn-sm folder-action-btn"
                                onClick={() => setIsDelete(true)}
                                title="Delete"
                            >
                                <i className="fas fa-times"></i>
                            </div>
                        </div>

                        {/* Folder Content */}
                        <a
                            className="folder-content"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={`${translations["createdAt"]} ${formatDate(
                                collection.createdAt,
                                translations["language"]
                            )}`}
                            href={`/${languageCode}/collection/${collection.id}`}
                        >
                            <div className="folder-icon-wrapper">
                                <i
                                    className="fas fa-folder"
                                    style={{ color: collection.color }}
                                ></i>
                            </div>
                            <div className="folder-info">
                                <p className="folder-word-count">
                                    <i className="fas fa-book" />{" "}
                                    {
                                        translations[
                                        "collectionPage.collectionCard.numberOfWords"
                                        ]
                                    }
                                    : <strong>{collection.numOfWords}</strong>
                                </p>
                            </div>
                        </a>
                    </div>
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
