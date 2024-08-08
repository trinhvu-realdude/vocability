import { useEffect, useState } from "react";
import { WordDto } from "../interfaces/model";
import { addWordToFavorite, getFavoriteWords } from "../services/WordService";
import initDB from "../utils/database";
import { CommonProps } from "../interfaces/props";
import { handleTextToSpeech } from "../utils/helper";

export const FavoritePage: React.FC<CommonProps> = ({ db }) => {
    const [favoriteWords, setFavoriteWords] = useState<WordDto[]>([]);

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
        };
        fetchFavorite();
    }, []);

    return (
        <div className="container-list" id="favorite-collection">
            <h4 className="text-center mt-4">
                <span style={{ color: "red" }}>
                    <strong>Favorite</strong>
                </span>{" "}
                collection
            </h4>

            <div className="list-group mt-4">
                {favoriteWords && favoriteWords.length > 0 ? (
                    favoriteWords.map((word) => (
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
                    ))
                ) : (
                    <div className="text-center">
                        &#128531; No found word in{" "}
                        <span style={{ color: "red" }}>Favorite</span>{" "}
                        collection
                    </div>
                )}
            </div>
        </div>
    );
};
