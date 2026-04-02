import { CommonProps, FilterSortingOption } from "../interfaces/mainProps";
import "../App.css";
import { CollectionCard } from "../components/Card/CollectionCard";
import { CollectionListItem } from "../components/Card/CollectionListItem";
import { NoDataMessage } from "../components/NoDataMessage";
import { APP_NAME } from "../utils/constants";
import { CreateCollectionModal } from "../components/Modal/CreateCollectionModal";
import { useLanguage } from "../LanguageContext";
import { SearchBar } from "../components/SearchBar";
import { Collection } from "../interfaces/model";
import { PageHeader } from "../components/PageHeader";
import { useState, useEffect } from "react";
import { ReviewModal } from "../components/Modal/ReviewModal";
import "../styles/CollectionPage.css";

type TabKey = "mine" | "shared";

export const CollectionPage: React.FC<CommonProps> = ({
    collections,
    sharedCollections = [],
    setCollections,
    onShowToast,
    isLoading,
}) => {
    const { translations } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabKey>("mine");

    // My Collections state
    const [filteredCollections, setFilteredCollections] = useState<Collection[]>(collections);
    const [filterSorting, setFilterSorting] = useState<FilterSortingOption>();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(
        (localStorage.getItem('collection_view_mode') as 'grid' | 'list') || 'list'
    );

    // Shared with Me state
    const [filteredSharedCollections, setFilteredSharedCollections] = useState<Collection[]>(sharedCollections);
    const [filterSortingShared, setFilterSortingShared] = useState<FilterSortingOption>();

    // My Collections (Owned only)
    const myTabCollections = collections;

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewCollectionId, setReviewCollectionId] = useState<number | null>(null);
    const [reviewCollectionName, setReviewCollectionName] = useState("");
    const [reviewCollectionColor, setReviewCollectionColor] = useState("");

    useEffect(() => {
        localStorage.setItem('collection_view_mode', viewMode);
    }, [viewMode]);

    const renderCollectionList = (list: Collection[]) => {
        if (viewMode === 'grid') {
            return list.map((collection) => (
                <CollectionCard
                    key={collection.id}
                    collection={collection}
                    setCollections={setCollections}
                    onShowToast={onShowToast}
                />
            ));
        } else {
            return (
                <div className="col-12">
                    {list.map((collection) => (
                        <CollectionListItem
                            key={collection.id}
                            collection={collection}
                            setCollections={setCollections}
                            onShowToast={onShowToast}
                        />
                    ))}
                </div>
            );
        }
    };

    // Listen for review modal open event
    useEffect(() => {
        const handleOpenReviewModal = (event: any) => {
            const { collectionId, collectionName, collectionColor } = event.detail;
            setReviewCollectionId(collectionId);
            setReviewCollectionName(collectionName);
            setReviewCollectionColor(collectionColor);
            setIsReviewModalOpen(true);
        };
        window.addEventListener('openReviewModal', handleOpenReviewModal);
        return () => { window.removeEventListener('openReviewModal', handleOpenReviewModal); };
    }, []);

    document.title = `${translations["flag"]} All collections | ${APP_NAME}`;

    return (
        <div className="container-list" id="collection-list">
            <PageHeader content={translations["collectionPage.title"]} />

            <SearchBar
                isFavorite={false}
                type="collection"
                collections={activeTab === "mine" ? myTabCollections : sharedCollections}
                filterSorting={activeTab === "mine" ? filterSorting : filterSortingShared}
                setFilterSorting={activeTab === "mine" ? setFilterSorting : setFilterSortingShared}
                setFilteredCollections={activeTab === "mine" ? setFilteredCollections : setFilteredSharedCollections}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {/* ── Tabs ────────────────────────────────────────────── */}
            <div className="collection-tabs mt-2">
                <button
                    className={`collection-tab-btn ${activeTab === "mine" ? "active" : ""}`}
                    onClick={() => setActiveTab("mine")}
                >
                    <i className="fas fa-folder me-2" />
                    {translations["collectionPage.tabs.myCollections"] || "My Collections"}
                </button>
                <button
                    className={`collection-tab-btn ${activeTab === "shared" ? "active" : ""}`}
                    onClick={() => setActiveTab("shared")}
                >
                    <i className="fas fa-share-alt me-2" />
                    {translations["collectionPage.tabs.sharedWithMe"] || "Shared with Me"}
                    {sharedCollections.length > 0 && (
                        <span className="collection-tab-badge">{sharedCollections.length}</span>
                    )}
                </button>
            </div>

            {/* ── My Collections ──────────────────────────────────── */}
            {activeTab === "mine" && (
                <>
                    <div className="row mt-4 mb-2">
                        {isLoading ? (
                            <div className="mx-auto loader" />
                        ) : filteredCollections && filteredCollections.length > 0 ? (
                            <>
                                {renderCollectionList(filteredCollections.filter(c => !c.myRole || c.myRole === 'owner'))}
                            </>
                        ) : (
                            <NoDataMessage message={`${translations["collectionPage.noDataMessage"]}`} />
                        )}
                    </div>
                    <CreateCollectionModal setCollections={setCollections} />
                </>
            )}

            {/* ── Shared with Me ──────────────────────────────────── */}
            {activeTab === "shared" && (
                <div className="row mt-4 mb-2">
                    {isLoading ? (
                        <div className="mx-auto loader" />
                    ) : filteredSharedCollections.length > 0 ? (
                        <>
                            {renderCollectionList(filteredSharedCollections.filter(c => c.myRole === 'editor'))}
                            
                            {filteredSharedCollections.some(c => c.myRole === 'editor') &&
                                filteredSharedCollections.some(c => c.myRole === 'viewer') && (
                                    <div className="col-12 my-4">
                                        <div className="collection-separator">
                                            <hr />
                                            <span className="separator-label">
                                                <i className="fas fa-eye me-2" />
                                                {translations["collectionPage.shared.viewerLabel"] || "Shared as Viewer"}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                            {renderCollectionList(filteredSharedCollections.filter(c => c.myRole === 'viewer'))}
                        </>
                    ) : (
                        <NoDataMessage message={sharedCollections.length === 0 ? translations["collectionPage.shared.noData"] || "No collections have been shared with you yet." : translations["collectionPage.shared.noMatch"] || "No matching shared collections found."} />
                    )}
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                collectionId={reviewCollectionId ? String(reviewCollectionId) : null}
                collectionName={reviewCollectionName}
                collectionColor={reviewCollectionColor}
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />
        </div>
    );
};
