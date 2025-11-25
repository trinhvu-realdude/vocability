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
    db,
    words,
    setWords,
    setCollections,
    setCurrentCollectionId,
}) => {
    const { collectionId } = useParams();
    const [collection, setCollection] = useState<Collection>();
    const [filteredWords, setFilteredWords] = useState<Word[]>(words);
    const [filterSorting, setFilterSorting] = useState<FilterSortingOption>();
    const [voicesByLanguage, setVoicesByLanguage] = useState<
        SpeechSynthesisVoice[]
    >([]);

    const { translations } = useLanguage();

    document.title = collection
        ? `${translations["flag"]} ${APP_NAME} | ${collection.name} collection`
        : APP_NAME;

    useEffect(() => {
        const fetchCollection = async () => {
            if (db && collectionId) {
                setCurrentCollectionId(collectionId);
                const objCollection = await getCollectionById(
                    db,
                    Number.parseInt(collectionId)
                );
                setCollection(objCollection);
                const objWord = await getWordsByCollectionId(
                    db,
                    Number.parseInt(collectionId)
                );
                setWords(objWord);
                setVoicesByLanguage(
                    await getVoicesByLanguage(translations["languageVoice"])
                );
            }
        };
        fetchCollection();
    }, [translations["language"]]);

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

            {db && collection && words.length > 0 && (
                <LeftOffCanvas
                    db={db}
                    collection={collection}
                    words={words}
                    setWords={setWords}
                />
            )}

            <PageHeader
                href={`/${translations["language"]}/collections`}
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
                            data-bs-toggle="modal"
                            data-bs-target={`#edit-collection-${collection?.id}`}
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
            />

            <div className="list-group mt-4">
                {filteredWords &&
                    filteredWords.length > 0 &&
                    filteredWords.map((word) => (
                        <WordCard
                            key={word.id}
                            db={db}
                            word={word}
                            collection={collection}
                            filterSorting={filterSorting}
                            setWords={setFilteredWords}
                            voicesByLanguage={voicesByLanguage}
                        />
                    ))}
            </div>

            {!filteredWords ||
                (filteredWords.length <= 0 && (
                    <NoDataMessage message={translations["noFoundWord"]} />
                ))}

            {collection && (
                <EditCollectionModal
                    db={db}
                    collection={collection}
                    setCollection={setCollection}
                    setCollections={setCollections}
                />
            )}
        </div>
    );
};
