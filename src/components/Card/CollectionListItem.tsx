import React, { useEffect, useState } from "react";
import { Collection, CollectionShare, Word } from "../../interfaces/model";
import { getWordsByCollectionId } from "../../services/WordService";
import { useLanguage } from "../../LanguageContext";
import { formatDate } from "../../utils/formatDateString";
import { EditCollectionModal } from "../Modal/EditCollectionModal";
import { DeleteCollectionModal } from "../Modal/DeleteCollectionModal";
import { ShareModal } from "../Modal/ShareModal";
import { AvatarStack } from "../AvatarStack";
import "../../styles/CollectionListItem.css";
import { getWordsForReview } from "../../services/SpacedRepetitionService";
import { ToastType } from "../../components/Toast";
import { usePermissions } from "../../utils/usePermissions";
import { getSharesForCollection } from "../../services/ShareService";

interface CollectionListItemProps {
    collection: Collection;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    onShowToast?: (message: string, type: ToastType) => void;
}

export const CollectionListItem: React.FC<CollectionListItemProps> = ({
    collection,
    setCollections,
    onShowToast,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [words, setWords] = useState<Word[]>([]);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [shares, setShares] = useState<CollectionShare[]>([]);

    // Action states
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [isShare, setIsShare] = useState(false);

    const { translations } = useLanguage();
    const { canEdit, canShare, canDelete, canPractice } = usePermissions(collection.id);

    const fetchData = React.useCallback(async () => {
        if (collection.id) {
            const [reviewWords, allWords] = await Promise.all([
                getWordsForReview(collection.id),
                getWordsByCollectionId(collection.id)
            ]);
            setReviewCount(reviewWords?.length || 0);
            setWords(allWords);
            setIsLoading(false);
        }
    }, [collection.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!collection.id) return;
        getSharesForCollection(collection.id).then(setShares).catch(() => { });
    }, [collection.id]);

    useEffect(() => {
        const handleRefresh = () => { fetchData(); };
        window.addEventListener('reviewCountUpdated', handleRefresh);
        return () => { window.removeEventListener('reviewCountUpdated', handleRefresh); };
    }, [fetchData]);

    const handleToggle = () => { setIsExpanded(!isExpanded); };

    const triggerReview = (e: React.MouseEvent) => {
        e.stopPropagation();
        const event = new CustomEvent('openReviewModal', {
            detail: {
                collectionId: collection.id,
                collectionName: collection.name,
                collectionColor: collection.color,
            }
        });
        window.dispatchEvent(event);
    };

    return (
        <>
            <div className={`collection-list-item ${isExpanded ? 'expanded' : ''}`}>
                <div
                    className="collection-list-header"
                    onClick={handleToggle}
                    style={{ borderLeftColor: collection.color }}
                >
                    <div className="collection-info-group">
                        <i className="fas fa-folder fa-lg" style={{ color: collection.color }} />
                        <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <a
                                    href={`/${translations["language"]}/collection/${collection.id}`}
                                    className="collection-name-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h5 className="collection-name me-2">{collection.name}</h5>
                                </a>
                                {!isLoading && words && (
                                    <span className={`badge ${words.length > 0 ? 'bg-light text-dark' : 'bg-secondary-soft text-muted'} word-count-badge`}>
                                        {words.length === 0 ? translations["collection.wordCount.empty"] :
                                            words.length === 1 ? `1 ${translations["collection.wordCount.singular"]}` :
                                                `${words.length} ${translations["collection.wordCount.plural"]}`}
                                    </span>
                                )}
                                {/* Role badge for shared-with-me */}
                                {collection.myRole && collection.myRole !== 'owner' && (
                                    <span className={`badge role-badge-inline role-${collection.myRole}`}>
                                        {collection.myRole}
                                    </span>
                                )}
                                {/* Avatar stack */}
                                {shares.length > 0 && (
                                    <AvatarStack shares={shares} maxVisible={3} size={22} />
                                )}
                            </div>
                            <small className="text-muted">
                                {collection.created_at && formatDate(new Date(collection.created_at), translations["language"])}
                            </small>
                        </div>
                    </div>

                    <div className="d-flex align-items-center">
                        <div className="collection-actions-group">
                            {/* Open */}
                            <a
                                href={`/${translations["language"]}/collection/${collection.id}`}
                                className="btn list-action-btn"
                                onClick={(e) => e.stopPropagation()}
                                title="Open Collection"
                            >
                                <i className="fas fa-external-link-alt" />
                            </a>

                            {/* Share */}
                            {canShare && (
                                <button
                                    className="btn list-action-btn"
                                    onClick={(e) => { e.stopPropagation(); setIsShare(true); }}
                                    title="Share Collection"
                                >
                                    <i className="fas fa-user-plus" />
                                </button>
                            )}

                            {/* Review */}
                            {canPractice && (
                                <button
                                    className="btn list-action-btn position-relative"
                                    onClick={triggerReview}
                                    title="Start Review"
                                >
                                    <i className="fas fa-brain" />
                                    {reviewCount > 0 && (
                                        <span
                                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                            style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}
                                        >
                                            {reviewCount}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Edit */}
                            {canEdit && (
                                <button
                                    className="btn list-action-btn"
                                    onClick={(e) => { e.stopPropagation(); setIsEdit(true); }}
                                    title="Edit"
                                >
                                    <i className="fas fa-pen" />
                                </button>
                            )}

                            {/* Delete */}
                            {canDelete && (
                                <button
                                    className="btn list-action-btn"
                                    onClick={(e) => { e.stopPropagation(); setIsDelete(true); }}
                                    title="Delete"
                                >
                                    <i className="fas fa-times" />
                                </button>
                            )}
                        </div>

                        <div className="btn-accordion-toggle">
                            <i className="fas fa-chevron-down" />
                        </div>
                    </div>
                </div>

                <div className={`collection-accordion-body ${isExpanded ? 'expanded' : ''}`}>
                    <div className="row g-2">
                        {words && words.length > 0 ? (
                            words.map(word => (
                                <div key={word.id} className="col-md-4 col-sm-6">
                                    <div className="mini-word-row">
                                        <span className="mini-word-text"><a
                                            href={`/${translations["language"]}/word/${word.id}`}
                                            className="word-link"
                                            style={{
                                                display: "block",
                                                textDecoration: "none",
                                                color: "inherit",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            <strong>{word.word}</strong>{" "}
                                        </a></span>
                                        {word.part_of_speech && <span className="mini-word-pos">{word.part_of_speech}</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted my-3">{translations["collection.noWords"]}</p>
                        )}
                    </div>
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
        </>
    );
};
