import initDB from "../configs/database";
import { useEffect, useState } from "react";
import { Collection, WordDto } from "../interfaces/model";
import { addWordToFavorite, getFavoriteWords } from "../services/WordService";
import { CommonProps } from "../interfaces/mainProps";
import { getCurrentLanguageId } from "../utils/helper";
import { NoDataMessage } from "../components/NoDataMessage";
import { SearchBar } from "../components/SearchBar";
import { PageHeader } from "../components/PageHeader";
import { APP_NAME, languages } from "../utils/constants";
import { useParams } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { TextToSpeechButton } from "../components/TextToSpeechButton";

export const FavoritePage: React.FC<CommonProps> = ({ db }) => {
    const { translations } = useLanguage();
    document.title = `${translations["flag"]} ${APP_NAME} | Favorite collection`;

    const [favoriteWords, setFavoriteWords] = useState<WordDto[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<Collection>();
    const [filteredWords, setFilteredWords] = useState<WordDto[]>([]);
    const [displayWords, setDisplayWords] = useState<WordDto[]>([]);

    const { language } = useParams();

    const handleRemoveFavorite = async (word: WordDto) => {
        const isFavorite = false;
        if (db) {
            await addWordToFavorite(db, word, isFavorite);
            const currentLanguageId = await getCurrentLanguageId(
                languages,
                language ? language : ""
            );
            const words = await getFavoriteWords(db, currentLanguageId);
            if (selectedCollection) {
                const filtered = words.filter(
                    (w) => w.collection.name === selectedCollection.name
                );
                setFavoriteWords(filtered);
                setFilteredWords(filtered);
            } else {
                setFavoriteWords(words);
                setFilteredWords(words);
            }
            alert(translations["alert.removeFavoriteWord"]);
        }
    };

    const handleFilter = (collection: Collection | null) => {
        setSelectedCollection(collection || undefined);
        const filtered = collection
            ? favoriteWords.filter(
                  (word) => word.collection.name === collection.name
              )
            : favoriteWords;
        setFilteredWords(filtered);
        setDisplayWords(filtered);
    };

    useEffect(() => {
        const fetchFavorite = async () => {
            const dbInstance = await initDB();
            const currentLanguageId = await getCurrentLanguageId(
                languages,
                language ? language : ""
            );
            const words = await getFavoriteWords(dbInstance, currentLanguageId);
            setFavoriteWords(words);
            setFilteredWords(words);
            const collectionsInFavorite = words.map((word) => word.collection);
            const uniqueCollections = Array.from(
                new Set(
                    collectionsInFavorite.map((collection) => collection.name)
                )
            )
                .map((name) =>
                    collectionsInFavorite.find(
                        (collection) => collection.name === name
                    )
                )
                .sort((a, b) => {
                    const idA = a?.id !== undefined ? a.id : Infinity;
                    const idB = b?.id !== undefined ? b.id : Infinity;
                    return idA - idB;
                });
            setCollections(uniqueCollections.filter(Boolean) as Collection[]);
        };
        fetchFavorite();
    }, []);

    return (
        <div className="container-list" id="favorite-collection">
            <PageHeader
                href={document.referrer}
                content={
                    <>
                        <span style={{ color: "#FFC000" }}>
                            <strong>
                                {translations["navbar.collections.favorite"]}
                            </strong>
                        </span>{" "}
                        {new String(
                            translations["addWordForm.collection"]
                        ).toLowerCase()}
                    </>
                }
            />

            {collections.length > 0 && (
                <SearchBar
                    isFavorite={true}
                    type="word"
                    filteredWords={filteredWords}
                    collections={collections}
                    selectedCollection={selectedCollection}
                    setDisplayWordDtos={setDisplayWords}
                    handleFilter={handleFilter}
                />
            )}

            <div className="list-group mt-4">
                {displayWords &&
                    displayWords.length > 0 &&
                    displayWords.map((word) => (
                        <div className="list-group-item" key={word.id}>
                            <div className="d-flex w-100 justify-content-between mb-2">
                                <div className="row">
                                    <h5 className="mb-1">
                                        <strong>{word.word}</strong>{" "}
                                        <small
                                            className="text-muted mb-1"
                                            style={{ fontSize: "14px" }}
                                        >
                                            {word.phonetic}
                                        </small>{" "}
                                        <TextToSpeechButton word={word.word} />
                                    </h5>
                                    <small>
                                        <i>{word.partOfSpeech}</i>
                                    </small>
                                </div>
                                <div>
                                    <div className="btn btn-sm">
                                        <i
                                            className="fas fa-times"
                                            onClick={() =>
                                                handleRemoveFavorite(word)
                                            }
                                        ></i>
                                    </div>
                                </div>
                            </div>

                            <ul className="list-group list-group-flush">
                                {/* Multiple definitions view */}
                                {word.definitions &&
                                    word.definitions.map(
                                        (definition, index) => (
                                            <li
                                                className="list-group-item"
                                                key={index}
                                            >
                                                <p className="mb-2">
                                                    {definition.definition.trim()}
                                                </p>
                                            </li>
                                        )
                                    )}
                            </ul>
                            <a
                                href={`/${translations["language"]}/collection/${word.collection.id}`}
                            >
                                <small className="text-muted">
                                    &#8618; {translations["goTo"]}{" "}
                                    <span
                                        style={{ color: word.collection.color }}
                                    >
                                        <strong>{word.collection.name}</strong>
                                    </span>{" "}
                                    {new String(
                                        translations["addWordForm.collection"]
                                    ).toLowerCase()}
                                </small>
                            </a>
                        </div>
                    ))}
            </div>

            {!filteredWords ||
                (filteredWords.length <= 0 && (
                    <NoDataMessage message={translations["noFoundWord"]} />
                ))}
        </div>
    );
};
