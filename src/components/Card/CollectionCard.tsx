import React, { useState, useEffect } from "react";
import { CollectionCardProps } from "../../interfaces/mainProps";
import { CollectionShare } from "../../interfaces/model";
import { EditCollectionModal } from "../Modal/EditCollectionModal";
import { DeleteCollectionModal } from "../Modal/DeleteCollectionModal";
import { ShareModal } from "../Modal/ShareModal";
import { AvatarStack } from "../AvatarStack";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";
import { usePermissions } from "../../utils/usePermissions";
import { getSharesForCollection } from "../../services/ShareService";
import "../../styles/CollectionCard.css";
import { getWordsForReview } from "../../services/SpacedRepetitionService";

export const CollectionCard: React.FC<CollectionCardProps> = ({
    collection,
    setCollections,
    onShowToast,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [isShare, setIsShare] = useState<boolean>(false);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [shares, setShares] = useState<CollectionShare[]>([]);

    const { translations } = useLanguage();
    const { canEdit, canShare, canDelete, canPractice } = usePermissions(collection.id);

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
        if (!collection.id) return;
        getSharesForCollection(collection.id).then(setShares).catch(() => { });
    }, [collection.id]);

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
                    style={{ backgroundColor: collection.color }}
                >
                    <span className="folder-tab-name">{collection.name}</span>
                </div>

                {/* Folder Body */}
                <div
                    className="folder-body"
                    style={{ borderColor: collection.color }}
                >
                    {/* Action Buttons */}
                    <div className="folder-actions">
                        {/* Share */}
                        {canShare && (
                            <div
                                className="btn btn-sm folder-action-btn"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsShare(true); }}
                                title="Share Collection"
                            >
                                <i className="fas fa-user-plus" />
                            </div>
                        )}

                        {/* Review */}
                        {canPractice && (
                            <div
                                className="btn btn-sm folder-action-btn position-relative"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
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
                                <i className="fas fa-brain" />
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
                        )}

                        {/* Edit */}
                        {canEdit && (
                            <div
                                className="btn btn-sm folder-action-btn"
                                onClick={() => setIsEdit(true)}
                                title="Edit Collection"
                            >
                                <i className="fas fa-pen" />
                            </div>
                        )}

                        {/* Delete */}
                        {canDelete && (
                            <div
                                className="btn btn-sm folder-action-btn"
                                onClick={() => setIsDelete(true)}
                                title="Delete Collection"
                            >
                                <i className="fas fa-times" />
                            </div>
                        )}
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
                            />
                        </div>
                        <div className="folder-info">
                            <p className="folder-word-count">
                                <small className="text-muted">
                                    {collection.created_at && formatDate(new Date(collection.created_at), translations["language"])}
                                </small>
                            </p>
                        </div>
                    </a>

                    {/* Avatar Stack & Owner info */}
                    <div className="folder-user-meta mt-2 d-flex align-items-center justify-content-between">
                        {shares.length > 0 && (
                            <div className="folder-avatar-stack">
                                <AvatarStack shares={shares} maxVisible={3} size={24} />
                            </div>
                        )}
                    </div>

                    {/* Shared-with-me role badge */}
                    {collection.myRole && collection.myRole !== 'owner' && (
                        <span className={`folder-role-badge role-${collection.myRole}`}>
                            {collection.myRole}
                        </span>
                    )}
                </div>
            </div>

            {isEdit && canEdit && (
                <EditCollectionModal
                    collection={collection}
                    setCollections={setCollections}
                    setIsEditOrDelete={setIsEdit}
                    onShowToast={onShowToast}
                />
            )}

            {isDelete && canDelete && (
                <DeleteCollectionModal
                    collection={collection}
                    setIsEditOrDelete={setIsDelete}
                    setCollections={setCollections}
                    onShowToast={onShowToast}
                />
            )}

            {isShare && canShare && (
                <ShareModal
                    collection={collection}
                    onClose={() => setIsShare(false)}
                    onShowToast={onShowToast}
                />
            )}
        </div>
    );
};
