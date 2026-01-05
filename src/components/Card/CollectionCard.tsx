import React, { useState, useEffect } from "react";
import { CollectionCardProps } from "../../interfaces/mainProps";
import { EditCollectionForm } from "../Form/EditCollectionForm";
import { DeleteCollectionForm } from "../Form/DeleteCollectionForm";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";
import "../../styles/CollectionCard.css"
import { getWordsForReview } from "../../services/SpacedRepetitionService";

export const CollectionCard: React.FC<CollectionCardProps> = ({
    db,
    collection,
    setCollections,
    languageCode,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [reviewCount, setReviewCount] = useState<number>(0);

    const { translations } = useLanguage();

    useEffect(() => {
        const fetchReviewCount = async () => {
            if (db && collection.id) {
                const words = await getWordsForReview(db, collection.id);
                setReviewCount(words.length);
            }
        };
        fetchReviewCount();
    }, [db, collection.id]);

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
                                className="btn btn-sm folder-action-btn position-relative"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Trigger review modal
                                    const event = new CustomEvent('openReviewModal', {
                                        detail: {
                                            collectionId: collection.id,
                                            collectionName: collection.name,
                                            collectionColor: collection.color,
                                        }
                                    });
                                    window.dispatchEvent(event);
                                }}
                                title="Start Review"
                            >
                                <i className="fas fa-brain"></i>
                                {reviewCount > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}
                                    >
                                        {reviewCount}
                                        <span className="visually-hidden">words due</span>
                                    </span>
                                )}
                            </div>
                            <div
                                className="btn btn-sm folder-action-btn"
                                onClick={() => setIsEdit(true)}
                                title="Edit Collection"
                            >
                                <i className="fas fa-pen"></i>
                            </div>
                            <div
                                className="btn btn-sm folder-action-btn"
                                onClick={() => setIsDelete(true)}
                                title="Delete Collection"
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
                                    :
                                    <strong>{collection.numOfWords}</strong>
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
