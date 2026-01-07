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

export const CollectionPage: React.FC<CommonProps> = ({
    db,
    collections,
    setCollections,
    onShowToast,
}) => {
    const { translations } = useLanguage();
    const [filteredCollections, setFilteredCollections] =
        useState<Collection[]>(collections);
    const [filterSorting, setFilterSorting] = useState<FilterSortingOption>();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(
        (localStorage.getItem('collection_view_mode') as 'grid' | 'list') || 'grid'
    );

    useEffect(() => {
        localStorage.setItem('collection_view_mode', viewMode);
    }, [viewMode]);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewCollectionId, setReviewCollectionId] = useState<number | null>(null);
    const [reviewCollectionName, setReviewCollectionName] = useState("");
    const [reviewCollectionColor, setReviewCollectionColor] = useState("");

    // Listen for review modal open event from CollectionCard
    useEffect(() => {
        const handleOpenReviewModal = (event: any) => {
            const { collectionId, collectionName, collectionColor } = event.detail;
            setReviewCollectionId(collectionId);
            setReviewCollectionName(collectionName);
            setReviewCollectionColor(collectionColor);
            setIsReviewModalOpen(true);
        };

        window.addEventListener('openReviewModal', handleOpenReviewModal);
        return () => {
            window.removeEventListener('openReviewModal', handleOpenReviewModal);
        };
    }, []);

    document.title = `${translations["flag"]} ${APP_NAME} | All collections`;

    return (
        <div className="container-list" id="collection-list">
            <PageHeader
                content={translations["collectionPage.title"]}
            />
            <SearchBar
                isFavorite={false}
                type="collection"
                collections={collections}
                filterSorting={filterSorting}
                setFilterSorting={setFilterSorting}
                setFilteredCollections={setFilteredCollections}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            <div className="row mt-4 mb-2">
                {filteredCollections && filteredCollections.length > 0 ? (
                    viewMode === 'grid' ? (
                        filteredCollections.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                db={db}
                                collection={collection}
                                setCollections={setCollections}
                                onShowToast={onShowToast}
                            />
                        ))
                    ) : (
                        <div className="col-12">
                            {filteredCollections.map((collection) => (
                                <CollectionListItem
                                    key={collection.id}
                                    db={db}
                                    collection={collection}
                                    setCollections={setCollections}
                                    onShowToast={onShowToast}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    <NoDataMessage
                        message={`${translations["collectionPage.noDataMessage"]}`}
                    />
                )}
            </div>
            <CreateCollectionModal db={db} setCollections={setCollections} />

            {/* Review Modal */}
            <ReviewModal
                db={db}
                collectionId={reviewCollectionId}
                collectionName={reviewCollectionName}
                collectionColor={reviewCollectionColor}
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
            />
        </div>
    );
};
