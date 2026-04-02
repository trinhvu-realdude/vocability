import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Collection, Word } from "../interfaces/model";
import { getWordsByCollectionIdPaginated } from "../services/WordService";
import { getCollectionById } from "../services/CollectionService";
import { FilterSortingOption, WordPageProps } from "../interfaces/mainProps";
import { WordCard } from "../components/Card/WordCard";
import { EditCollectionModal } from "../components/Modal/EditCollectionModal";
import { NoDataMessage } from "../components/NoDataMessage";
import { SearchBar } from "../components/SearchBar";
import { PageHeader } from "../components/PageHeader";
import { APP_NAME } from "../utils/constants";
import { useLanguage } from "../LanguageContext";
import { getVoicesByLanguage } from "../utils/helper";
import { LeftOffCanvas } from "../components/LeftOffCanvas";

export const WordPage: React.FC<WordPageProps> = ({
    words,
    setWords,
    setCollections,
    setCurrentCollectionId,
    onShowToast,
    collections = [],
    sharedCollections = [],
    isLoading: isMainLoading = false,
}) => {
    const { collectionId } = useParams();
    const [collection, setCollection] = useState<Collection>();
    const [filteredWords, setFilteredWords] = useState<Word[]>(words);
    const [filterSorting, setFilterSorting] = useState<FilterSortingOption>();
    const [voicesByLanguage, setVoicesByLanguage] = useState<
        SpeechSynthesisVoice[]
    >([]);
    const [isHideDefinition, setIsHideDefinition] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const loaderRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 5;

    const { translations } = useLanguage();

    document.title = collection
        ? `${translations["flag"]} ${collection.name} collection | ${APP_NAME}`
        : APP_NAME;

    const allCollections = useMemo(() => [
        ...collections,
        ...sharedCollections
    ], [collections, sharedCollections]);

    // 1. Fetch Words (Runs exactly once per collectionId)
    useEffect(() => {
        const fetchWords = async () => {
            if (!collectionId) return;
            setIsLoading(true);
            setCurrentCollectionId(collectionId);
            try {
                const objWord = await getWordsByCollectionIdPaginated(collectionId, 0, ITEMS_PER_PAGE - 1);
                setWords(objWord);
                setOffset(ITEMS_PER_PAGE);
                setHasMore(objWord.length === ITEMS_PER_PAGE);
            } catch (err) {
                console.error("Error fetching words:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWords();
    }, [collectionId, setCurrentCollectionId, setWords]);

    // 2. Resolve Collection (No DB call if already passed in props)
    useEffect(() => {
        if (!collectionId) return;
        const found = allCollections.find((c: Collection) => String(c.id) === collectionId);
        if (found) {
            setCollection(found);
        } else if (!isMainLoading) {
            // Fallback for direct URL hits without route state
            getCollectionById(collectionId).then(c => {
                setCollection(c || undefined);
            });
        }
    }, [collectionId, allCollections, isMainLoading]);

    // 3. Load TTS voices securely only when language specifies
    useEffect(() => {
        if (translations["languageVoice"]) {
            getVoicesByLanguage(translations["languageVoice"]).then(setVoicesByLanguage);
        }
    }, [translations["languageVoice"]]);

    const loadMoreWords = useCallback(async () => {
        if (isFetchingMore || !hasMore || !collectionId) return;

        setIsFetchingMore(true);
        try {
            const nextWords = await getWordsByCollectionIdPaginated(
                collectionId,
                offset,
                offset + ITEMS_PER_PAGE - 1
            );

            if (nextWords.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }

            setWords((prev) => [...prev, ...nextWords]);
            setOffset((prev) => prev + ITEMS_PER_PAGE);
        } catch (error) {
            console.error("Error loading more words:", error);
        } finally {
            setIsFetchingMore(false);
        }
    }, [isFetchingMore, hasMore, collectionId, offset, setWords]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingMore) {
                    loadMoreWords();
                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loadMoreWords, hasMore, isLoading, isFetchingMore]);

    return (
        <div className="container-list" id="word-list">
            <button
                className="word-list-btn"
                data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasWithBackdrop"
                aria-controls="offcanvasWithBackdrop"
                style={{
                    backgroundColor: collection?.color,
                }}
            >
                <i className="fa fa-angle-right"></i>
            </button>

            {collection && words.length > 0 && (
                <LeftOffCanvas
                    collection={collection}
                    words={words}
                />
            )}

            <PageHeader
                content={
                    <>
                        <span style={{ color: collection?.color }}>
                            <strong>{collection?.name}</strong>
                        </span>{" "}
                        {new String(
                            translations["addWordForm.collection"]
                        ).toLowerCase()}
                        <div
                            className="btn btn-sm mx-2"
                            style={{
                                border: "none",
                            }}
                            onClick={() => setIsEdit(true)}
                        >
                            <i className="fas fa-pen"></i>
                        </div>
                    </>
                }
            />

            <SearchBar
                isFavorite={false}
                type="word"
                words={words}
                filterSorting={filterSorting}
                setFilterSorting={setFilterSorting}
                setFilteredWords={setFilteredWords}
                isHideDefinition={isHideDefinition}
                selectedCollection={collection}
                onToggleHideDefinition={() => setIsHideDefinition(prev => !prev)}
            />

            <div className="list-group mt-4">
                {isLoading ? (
                    <div className="mx-auto loader"></div>
                ) : filteredWords &&
                    filteredWords.length > 0 ? (
                    filteredWords.map((word) => (
                        <WordCard
                            key={word.id}
                            word={word}
                            collection={collection}
                            filterSorting={filterSorting}
                            setWords={setFilteredWords}
                            voicesByLanguage={voicesByLanguage}
                            onShowToast={onShowToast}
                            isHideDefinition={isHideDefinition}
                        />
                    ))
                ) : (
                    <NoDataMessage message={translations["noFoundWord"]} />
                )}

                {hasMore && !isLoading && (
                    <div ref={loaderRef} className="d-flex justify-content-center p-4">
                        {isFetchingMore && (
                            <div className="mx-auto loader"></div>
                        )}
                    </div>
                )}
            </div>

            {isEdit && collection && (
                <EditCollectionModal
                    collection={collection}
                    setCollection={setCollection}
                    setCollections={setCollections}
                    setIsEditOrDelete={setIsEdit}
                    onShowToast={onShowToast}
                />
            )}
        </div>
    );
};
