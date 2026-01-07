import React, { useState } from "react";
import { Collection, Word } from "../../interfaces/model";
import { IDBPDatabase } from "idb";
import { MyDB } from "../../interfaces/model";
import { getWordsByCollectionId } from "../../services/WordService";
import { useLanguage } from "../../LanguageContext";
import { formatDate } from "../../utils/formatDateString";
import { EditCollectionModal } from "../Modal/EditCollectionModal";
import { DeleteCollectionModal } from "../Modal/DeleteCollectionModal";
import "../../styles/CollectionListItem.css";
import { getWordsForReview } from "../../services/SpacedRepetitionService";
import { ToastType } from "../../components/Toast";

interface CollectionListItemProps {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    onShowToast?: (message: string, type: ToastType) => void;
}

export const CollectionListItem: React.FC<CollectionListItemProps> = ({
    db,
    collection,
    setCollections,
    onShowToast,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [words, setWords] = useState<Word[]>([]);
    const [isLoadingWords, setIsLoadingWords] = useState(false);
    const [reviewCount, setReviewCount] = useState<number>(0);

    // Action states
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);

    const { translations } = useLanguage();

    // Fetch review count on mount
    React.useEffect(() => {
        const fetchReviewCount = async () => {
            if (db && collection.id) {
                const reviewWords = await getWordsForReview(db, collection.id);
                setReviewCount(reviewWords.length);
            }
        };
        fetchReviewCount();
    }, [db, collection.id]);

    const handleToggle = async () => {
        if (!isExpanded && words.length === 0) {
            setIsLoadingWords(true);
            try {
                if (db && collection.id) {
                    const fetchedWords = await getWordsByCollectionId(db, collection.id);
                    setWords(fetchedWords);
                }
            } catch (error) {
                console.error("Failed to fetch words", error);
            } finally {
                setIsLoadingWords(false);
            }
        }
        setIsExpanded(!isExpanded);
    };

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
                        <i className="fas fa-folder fa-lg" style={{ color: collection.color }}></i>
                        <div>
                            <h5 className="collection-name">{collection.name}</h5>
                            <small className="text-muted">
                                {formatDate(collection.createdAt, translations["language"])}
                            </small>
                        </div>
                    </div>

                    <div className="d-flex align-items-center">
                        <div className="collection-actions-group">
                            <a
                                href={`/${translations["language"]}/collection/${collection.id}`}
                                className="btn list-action-btn"
                                onClick={(e) => e.stopPropagation()}
                                title="Open Collection"
                            >
                                <i className="fas fa-external-link-alt"></i>
                            </a>
                            <button
                                className="btn list-action-btn position-relative"
                                onClick={triggerReview}
                                title="Start Review"
                            >
                                <i className="fas fa-brain"></i>
                                {reviewCount > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        style={{ fontSize: '0.6rem', padding: '0.25em 0.4em' }}
                                    >
                                        {reviewCount}
                                    </span>
                                )}
                            </button>
                            <button
                                className="btn list-action-btn"
                                onClick={(e) => { e.stopPropagation(); setIsEdit(true); }}
                                title="Edit"
                            >
                                <i className="fas fa-pen"></i>
                            </button>
                            <button
                                className="btn list-action-btn"
                                onClick={(e) => { e.stopPropagation(); setIsDelete(true); }}
                                title="Delete"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="btn-accordion-toggle">
                            <i className="fas fa-chevron-down"></i>
                        </div>
                    </div>
                </div>

                <div className={`collection-accordion-body ${isExpanded ? 'expanded' : ''}`}>
                    {isLoadingWords ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-secondary" role="status" style={{ width: '2rem', height: '2rem', borderWidth: '3px' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-2">
                            {words.length > 0 ? (
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
                                            {word.partOfSpeech && <span className="mini-word-pos">{word.partOfSpeech}</span>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted my-3">No words in this collection.</p>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {isEdit && (
                <EditCollectionModal
                    db={db}
                    collection={collection}
                    setCollections={setCollections}
                    setIsEditOrDelete={setIsEdit}
                    onShowToast={onShowToast}
                />
            )
            }

            {
                isDelete && (
                    <DeleteCollectionModal
                        db={db}
                        collection={collection}
                        setIsEditOrDelete={setIsDelete}
                        setCollections={setCollections}
                        onShowToast={onShowToast}
                    />
                )
            }
        </>
    );
};
