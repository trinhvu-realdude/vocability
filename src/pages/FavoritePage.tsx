
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

export const FavoritePage: React.FC<CommonProps> = ({ onShowToast }) => {
    const { translations } = useLanguage();
    document.title = `${translations["flag"]} Favorite collection | ${APP_NAME}`;

    const [favoriteWords, setFavoriteWords] = useState<WordDto[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<Collection>();
    const [filteredWords, setFilteredWords] = useState<WordDto[]>([]);
    const [displayWords, setDisplayWords] = useState<WordDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { language } = useParams();

    const handleRemoveFavorite = async (word: WordDto) => {
        // Optimistic update
        setFavoriteWords((prev) => prev.filter((w) => w.id !== word.id));
        setFilteredWords((prev) => prev.filter((w) => w.id !== word.id));
        setDisplayWords((prev) => prev.filter((w) => w.id !== word.id));

        try {
            await addWordToFavorite(word as any, false);
            onShowToast?.(
                translations["alert.removeFavoriteWord"],
                "success"
            );
            
            // Re-evaluate empty collections if needed, though they won't automatically disappear unless we filter collections too.
            // For now, removing the word from the list is sufficient for the optimistic update.
        } catch (error) {
            onShowToast?.("Failed to remove favorite word", "error");
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
            setIsLoading(true);
            const currentLanguageId = await getCurrentLanguageId(
                languages,
                language ? language : ""
            );
            const words = await getFavoriteWords(currentLanguageId);
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
                    const idA = a?.id !== undefined ? a.id : "";
                    const idB = b?.id !== undefined ? b.id : "";
                    return String(idA).localeCompare(String(idB));
                });
            setCollections(uniqueCollections.filter(Boolean) as Collection[]);
            setIsLoading(false);
        };
        fetchFavorite();
    }, []);

    return (
        <div className="container-list" id="favorite-collection">
            <PageHeader
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

            {isLoading ? (
                <div className="mx-auto loader"></div>
            ) : (
                <>
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
                                <div className="list-group-item word-card-hover p-4" key={word.id}>
                                    <div className="d-flex w-100 justify-content-between mb-2">
                                        <div className="row">
                                            <h5 className="mb-1 d-flex align-items-center gap-2">
                                                <strong>{word.word}</strong>{" "}
                                                <small
                                                    className="text-muted"
                                                    style={{ fontSize: "14px" }}
                                                >
                                                    {word.phonetic}
                                                </small>{" "}
                                                <TextToSpeechButton word={word.word} />
                                            </h5>
                                            <small>
                                                <i>{word.part_of_speech}</i>
                                            </small>
                                        </div>
                                        <div className="word-action">
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
                </>
            )}
        </div>
    );
};
