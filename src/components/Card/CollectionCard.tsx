import React, { useState, useEffect } from "react";
import { CollectionCardProps } from "../../interfaces/mainProps";
import { EditCollectionModal } from "../Modal/EditCollectionModal";
import { DeleteCollectionModal } from "../Modal/DeleteCollectionModal";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";
import "../../styles/CollectionCard.css"
import { getWordsForReview } from "../../services/SpacedRepetitionService";

export const CollectionCard: React.FC<CollectionCardProps> = ({
    collection,
    setCollections,
    onShowToast,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [reviewCount, setReviewCount] = useState<number>(0);

    const { translations } = useLanguage();

    const fetchReviewCount = React.useCallback(async () => {
        if (collection.id) {
            const words = await getWordsForReview(collection.id);
            setReviewCount(words?.length || 0);
        }
    }, [collection.id]);

    useEffect(() => {
        fetchReviewCount();
    }, [fetchReviewCount]);

    useEffect(() => {
        const handleRefresh = () => {
            fetchReviewCount();
        };

        window.addEventListener('reviewCountUpdated', handleRefresh);
        return () => {
            window.removeEventListener('reviewCountUpdated', handleRefresh);
        };
    }, [fetchReviewCount]);

    return (
        <div className="col-md-4 mb-4">
            <div className="folder-card" style={{ opacity: isEdit || isDelete ? 0.7 : 1 }}>
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
                        title={`${translations["createdAt"]} ${collection.created_at && formatDate(
                            new Date(collection.created_at),
                            translations["language"]
                        )}`}
                        href={`/${translations["language"]}/collection/${collection.id}`}
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
                                <strong>{collection.num_of_words}</strong>
                            </p>
                        </div>
                    </a>
                </div>
            </div>

            {isEdit && (
                <EditCollectionModal
                    collection={collection}
                    setCollections={setCollections}
                    setIsEditOrDelete={setIsEdit}
                    onShowToast={onShowToast}
                />
            )}

            {isDelete && (
                <DeleteCollectionModal
                    collection={collection}
                    setIsEditOrDelete={setIsDelete}
                    setCollections={setCollections}
                    onShowToast={onShowToast}
                />
            )}
        </div>
    );
};
