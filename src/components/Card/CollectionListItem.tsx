import React, { useEffect, useState } from "react";
import { Collection, CollectionShare, Word } from "../../interfaces/model";
import { getWordsByCollectionId, moveWordToCollection } from "../../services/WordService";
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
    const [words, setWords] = useState<Word[] | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [isLoadingWords, setIsLoadingWords] = useState<boolean>(false);
    const [shares, setShares] = useState<CollectionShare[]>([]);

    // Action states
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [isShare, setIsShare] = useState(false);

    const { translations } = useLanguage();
    const { canEdit, canShare, canDelete, canPractice } = usePermissions(collection.id, collection.myRole);

    const fetchInitialData = React.useCallback(async () => {
        if (collection.id && canPractice) {
            try {
                const reviewWords = await getWordsForReview(collection.id);
                setReviewCount(reviewWords?.length || 0);
            } catch (e) {
                console.error(e);
            }
        }
    }, [collection.id, canPractice]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (!collection.id) return;
        if (collection.myRole && collection.myRole !== 'owner') return; // Non-owners only display the owner avatar, no share table fetch needed
        getSharesForCollection(collection.id).then(setShares).catch(() => { });
    }, [collection.id, collection.myRole]);

    useEffect(() => {
        if (isExpanded && words === null && collection.id) {
            setIsLoadingWords(true);
            getWordsByCollectionId(collection.id).then(fetchedWords => {
                setWords(fetchedWords);
                setIsLoadingWords(false);
            }).catch(() => setIsLoadingWords(false));
        }
    }, [isExpanded, words, collection.id]);

    useEffect(() => {
        const handleRefresh = () => { fetchInitialData(); };
        window.addEventListener('reviewCountUpdated', handleRefresh);
        return () => { window.removeEventListener('reviewCountUpdated', handleRefresh); };
    }, [fetchInitialData]);

    useEffect(() => {
        const handleWordMoved = (e: any) => {
            const { wordId, fromCollectionId, toCollectionId } = e.detail;
            if (collection.id === fromCollectionId) {
                setWords(prev => prev ? prev.filter(w => w.id !== wordId) : null);
                setCollections(prev => prev.map(c =>
                    c.id === collection.id
                        ? { ...c, num_of_words: Math.max(0, (c.num_of_words || 1) - 1) }
                        : c
                ));
            } else if (collection.id === toCollectionId) {
                if (isExpanded && collection.id) {
                    getWordsByCollectionId(collection.id).then(fetchedWords => {
                        setWords(fetchedWords);
                    }).catch(() => { });
                }
                setCollections(prev => prev.map(c =>
                    c.id === collection.id
                        ? { ...c, num_of_words: (c.num_of_words || 0) + 1 }
                        : c
                ));
            }
        };
        window.addEventListener('wordMoved', handleWordMoved);
        return () => window.removeEventListener('wordMoved', handleWordMoved);
    }, [collection.id, isExpanded, setCollections]);

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

    const handleDragOver = (e: React.DragEvent) => {
        if (!canEdit) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!canEdit) return;
        const wordId = e.dataTransfer.getData('wordId');
        const sourceCollectionId = e.dataTransfer.getData('sourceCollectionId');

        if (!wordId || !sourceCollectionId || sourceCollectionId === collection.id) {
            return;
        }

        try {
            await moveWordToCollection(wordId, collection.id!);
            const event = new CustomEvent('wordMoved', {
                detail: {
                    wordId,
                    fromCollectionId: sourceCollectionId,
                    toCollectionId: collection.id
                }
            });
            window.dispatchEvent(event);
            if (onShowToast) onShowToast(translations["success"] || "Successfully moved word", "success");
        } catch (err) {
            if (onShowToast) onShowToast(translations["error"] || "Failed to move word", "error");
        }
    };

    return (
        <>
            <div
                className={`collection-list-item ${isExpanded ? 'expanded' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
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
                                {collection.num_of_words !== undefined && (
                                    <>
                                        {collection.num_of_words > 0 && (
                                            <span className="badge bg-light text-dark word-count-badge d-md-none">
                                                {collection.num_of_words}
                                            </span>
                                        )}
                                        <span className={`badge ${collection.num_of_words > 0 ? 'bg-light text-dark' : 'bg-secondary-soft text-muted'} word-count-badge d-none d-md-inline-block`}>
                                            {collection.num_of_words === 0 ? translations["collection.wordCount.empty"] :
                                                collection.num_of_words === 1 ? `1 ${translations["collection.wordCount.singular"]}` :
                                                    `${collection.num_of_words} ${translations["collection.wordCount.plural"]}`}
                                        </span>
                                    </>
                                )}
                                {/* Role badge for shared-with-me */}
                                {collection.myRole && collection.myRole !== 'owner' && (
                                    <span className={`badge role-badge-inline role-${collection.myRole}`}>
                                        {collection.myRole}
                                    </span>
                                )}
                                {/* Avatar stack */}
                                {collection.myRole && collection.myRole !== 'owner' ? (
                                    collection.owner_profile && (
                                        <AvatarStack
                                            shares={[{
                                                collection_id: collection.id || '',
                                                user_id: collection.owner_profile.id,
                                                role: 'owner',
                                                profile: collection.owner_profile
                                            }]}
                                            maxVisible={1}
                                            size={22}
                                        />
                                    )
                                ) : (
                                    shares.length > 0 && (
                                        <AvatarStack shares={shares} maxVisible={3} size={22} />
                                    )
                                )}
                            </div>
                            <small className="text-muted d-none d-md-block text-nowrap">
                                {collection.created_at && formatDate(new Date(collection.created_at), translations["language"])}
                            </small>
                        </div>
                    </div>

                    <div className="collection-actions-wrapper">
                        <small className="text-muted d-md-none fw-semibold text-nowrap me-3" style={{ fontSize: '0.875rem' }}>
                            {collection.created_at && new Date(collection.created_at).toLocaleDateString(
                                translations["language"] === "us" ? "en-US" : `${translations["language"]}-${translations["language"].toUpperCase()}`,
                                { day: '2-digit', month: 'short', year: 'numeric' }
                            )}
                        </small>
                        <div className="collection-actions-group m-0">
                            {/* Open */}
                            {/* <a
                                href={`/${translations["language"]}/collection/${collection.id}`}
                                className="btn list-action-btn"
                                onClick={(e) => e.stopPropagation()}
                                title="Open Collection"
                            >
                                <i className="fas fa-external-link-alt" />
                            </a> */}

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
                    </div>

                    <div className="header-chevron-wrapper">
                        <div className="btn-accordion-toggle">
                            <i className="fas fa-chevron-down" />
                        </div>
                    </div>
                </div>

                <div className={`collection-accordion-body ${isExpanded ? 'expanded' : ''}`}>
                    <div className="row g-2 p-2">
                        {isLoadingWords ? (
                            <div className="mx-auto loader" />
                        ) : words && words.length > 0 ? (
                            words.map(word => (
                                <div
                                    key={word.id}
                                    className="col-md-4 col-sm-6"
                                    draggable={canEdit}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('wordId', word.id || '');
                                        e.dataTransfer.setData('sourceCollectionId', collection.id || '');
                                        e.currentTarget.style.opacity = '0.5';
                                    }}
                                    onDragEnd={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }}
                                >
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
