import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Collection, Word } from "../interfaces/model";
import { getWordsByCollectionId } from "../services/WordService";
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

    const { translations } = useLanguage();

    document.title = collection
        ? `${translations["flag"]} ${collection.name} collection | ${APP_NAME}`
        : APP_NAME;

    useEffect(() => {
        const fetchCollection = async () => {
            setIsLoading(true);
            if (collectionId) {
                setCurrentCollectionId(collectionId);
                const objCollection = await getCollectionById(
                    collectionId
                );
                setCollection(objCollection || undefined);
                const objWord = await getWordsByCollectionId(
                    collectionId
                );
                setWords(objWord);
                setVoicesByLanguage(
                    await getVoicesByLanguage(translations["languageVoice"])
                );
            }
            setIsLoading(false);
        };
        fetchCollection();
    }, [translations["language"], collectionId]);

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
                    setWords={setWords}
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
