import initDB from "../configs/database";
import { useEffect, useState } from "react";
import { Collection, WordDto } from "../interfaces/model";
import { addWordToFavorite, getFavoriteWords } from "../services/WordService";
import { CommonProps } from "../interfaces/mainProps";
import { handleTextToSpeech } from "../utils/helper";
import { NoDataMessage } from "../components/NoDataMessage";
import { SearchBar } from "../components/SearchBar";
import { PageHeader } from "../components/PageHeader";
import { APP_NAME } from "../utils/constants";

let count = 1;

export const FavoritePage: React.FC<CommonProps> = ({ db }) => {
    console.log("FavoritePage " + count++);

    document.title = `${APP_NAME} | Favorite collection`;

    const [favoriteWords, setFavoriteWords] = useState<WordDto[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<Collection>();
    const [filteredWords, setFilteredWords] = useState<WordDto[]>([]);
    const [displayWords, setDisplayWords] = useState<WordDto[]>([]);

    const handleRemoveFavorite = async (word: WordDto) => {
        const isFavorite = false;
        if (db) {
            await addWordToFavorite(db, word, isFavorite);
            const words = await getFavoriteWords(db);
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
            alert(`Removed ${word.word} from Favorite collection`);
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
            const words = await getFavoriteWords(dbInstance);
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
                        <span style={{ color: "red" }}>
                            <strong>Favorite</strong>
                        </span>{" "}
                        collection
                    </>
                }
            />

            <SearchBar
                isFavorite={true}
                filteredWords={filteredWords}
                collections={collections}
                selectedCollection={selectedCollection}
                setDisplayWordDtos={setDisplayWords}
                handleFilter={handleFilter}
            />

            <div className="list-group mt-4">
                {displayWords &&
                    displayWords.length > 0 &&
                    displayWords.map((word) => (
                        <div className="list-group-item" key={word.id}>
                            <div className="d-flex w-100 justify-content-between mb-2">
                                <div className="row">
                                    <h5 className="mb-1">
                                        <strong>{word.word}</strong>{" "}
                                        <div
                                            className="btn btn-sm"
                                            style={{
                                                padding: 0,
                                                margin: 0,
                                            }}
                                            onClick={() =>
                                                handleTextToSpeech(word.word)
                                            }
                                        >
                                            <i className="fas fa-volume-up"></i>
                                        </div>
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
                            <p className="mb-1">{word.definition}</p>
                            <a href={`/collection/${word.collection.id}`}>
                                <small className="text-muted">
                                    &#8618; Go to{" "}
                                    <span
                                        style={{ color: word.collection.color }}
                                    >
                                        <strong>{word.collection.name}</strong>
                                    </span>{" "}
                                    collection
                                </small>
                            </a>
                        </div>
                    ))}
            </div>

            {!filteredWords ||
                (filteredWords.length <= 0 && (
                    <NoDataMessage
                        collectionColor="red"
                        collectionName="Favorite"
                    />
                ))}
        </div>
    );
};
