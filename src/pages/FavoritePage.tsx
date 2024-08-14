import initDB from "../configs/database";
import { useEffect, useState } from "react";
import { Collection, WordDto } from "../interfaces/model";
import { addWordToFavorite, getFavoriteWords } from "../services/WordService";
import { CommonProps } from "../interfaces/props";
import { handleTextToSpeech } from "../utils/helper";
import { NoDataMessage } from "../components/NoDataMessage";

export const FavoritePage: React.FC<CommonProps> = ({ db }) => {
    const [favoriteWords, setFavoriteWords] = useState<WordDto[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [collections, setCollections] = useState<Collection[]>([]);

    const handleRemoveFavorite = async (word: WordDto) => {
        const isFavorite = false;
        if (db) {
            await addWordToFavorite(db, word, isFavorite);
            const words = await getFavoriteWords(db);
            setFavoriteWords(words);
            alert(`Removed ${word.word} from Favorite collection`);
        }
    };

    useEffect(() => {
        const fetchFavorite = async () => {
            const dbInstance = await initDB();
            const words = await getFavoriteWords(dbInstance);
            setFavoriteWords(words);

            // const collectionsInFavorite = words.map((word) => {
            //     return word.collection;
            // });
            // const uniqueCollections = Array.from(
            //     new Set(
            //         collectionsInFavorite.map((collection) => collection.name)
            //     )
            // ).map((name) =>
            //     collectionsInFavorite.find(
            //         (collection) => collection.name === name
            //     )
            // );
            // setCollections(uniqueCollections.filter(Boolean) as Collection[]);
        };
        fetchFavorite();
    }, []);

    const filteredWords = favoriteWords.filter((word) =>
        word.word.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
        <div className="container-list" id="favorite-collection">
            <h4 className="text-center mt-4">
                <span style={{ color: "red" }}>
                    <strong>Favorite</strong>
                </span>{" "}
                collection
            </h4>

            <div className="input-group d-flex justify-content-center mt-4">
                <input
                    className="form-control"
                    type="search"
                    placeholder="Search word in collection"
                    aria-label="Search word in collection"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                />
                <button
                    className="btn"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                        border: "1px solid #ced4da",
                        borderTopRightRadius: "0.25rem",
                        borderBottomRightRadius: "0.25rem",
                    }}
                >
                    All collections
                </button>
                <ul className="dropdown-menu">
                    {collections.map((collection, index) => (
                        <li
                            key={index}
                            style={{ cursor: "default" }}
                            // onClick={handleFilter}
                        >
                            <a className="dropdown-item d-flex">
                                <div
                                    className="square"
                                    style={{
                                        backgroundColor: collection.color,
                                    }}
                                ></div>
                                <span className="ms-2">{collection.name}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="list-group mt-4">
                {filteredWords &&
                    filteredWords.length > 0 &&
                    filteredWords.map((word) => (
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
                            <a href={`/app/collection/${word.collection.id}`}>
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
