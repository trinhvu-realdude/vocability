import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Collection, Word } from "../interfaces/model";
import { useParams } from "react-router-dom";
import {
    addWordToFavorite,
    getSynonymsAntonyms,
    getWordById,
    getWordsByCollectionId,
} from "../services/WordService";
import { WordDetailPageProps } from "../interfaces/mainProps";
import { formatDate } from "../utils/formatDateString";
import { handleTextToSpeech } from "../utils/helper";
import { getCollectionById } from "../services/CollectionService";
import { OffCanvas } from "../components/OffCanvas";

export const WordDetailPage: React.FC<WordDetailPageProps> = ({ db }) => {
    const { wordId } = useParams();

    const [word, setWord] = useState<Word>();
    const [collection, setCollection] = useState<Collection>();
    const [synonyms, setSynonyms] = useState<string[]>();
    const [antonyms, setAntonyms] = useState<string[]>();

    const [visibleOffCanvas, setVisibleOffCanvas] = useState<string | null>(
        null
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    const handleAddFavorite = async (word: Word) => {
        setIsFavorite(!isFavorite);
        if (db) {
            await addWordToFavorite(db, word, isFavorite);
            if (word.id) {
                const updatedWord = await getWordById(db, word.id);
                setWord(updatedWord);
            }
        }
    };

    useEffect(() => {
        const fetchWord = async () => {
            if (db && wordId) {
                const objWord = await getWordById(db, Number.parseInt(wordId));
                if (objWord?.collectionId) {
                    const objCollection = await getCollectionById(
                        db,
                        objWord?.collectionId
                    );
                    setCollection(objCollection);
                }
                if (objWord) {
                    setWord(objWord);
                    const objSynonymsAntonyms = await getSynonymsAntonyms(
                        objWord
                    );
                    setSynonyms(objSynonymsAntonyms?.synonyms);
                    setAntonyms(objSynonymsAntonyms?.antonyms);
                }
            }
            setIsLoading(false);
        };
        fetchWord();
    }, []);

    const handleShowOffCanvas = async (id: string) => {
        setVisibleOffCanvas(id);
    };

    return (
        <div className="container-list" id="word-detail">
            <PageHeader
                href={`/collection/${word?.collectionId}`}
                content={
                    <>
                        <strong>{word?.word}</strong>
                    </>
                }
            />
            <div className="d-flex w-100 justify-content-between mb-2">
                <div className="row">
                    <h5 className="mb-1">
                        <a href={`/word/${word?.id}`} className="word-link">
                            <strong>{word?.word}</strong>{" "}
                        </a>
                        <small
                            className="text-muted mb-1"
                            style={{ fontSize: "14px" }}
                        >
                            {word?.phonetic}
                        </small>{" "}
                        <div
                            className="btn btn-sm"
                            style={{
                                padding: 0,
                                margin: 0,
                            }}
                            onClick={() =>
                                word?.word && handleTextToSpeech(word?.word)
                            }
                        >
                            <i className="fas fa-volume-up"></i>
                        </div>
                    </h5>
                    <small>
                        <i>{word?.partOfSpeech}</i>
                    </small>
                </div>
                <div>
                    <div className="btn btn-sm">
                        <i
                            className={`${
                                word?.isFavorite ? "fas" : "far"
                            } fa-heart`}
                            onClick={() => {
                                if (word) handleAddFavorite(word);
                            }}
                            style={{
                                color: `${word?.isFavorite ? "red" : ""}`,
                            }}
                        ></i>
                    </div>
                </div>
            </div>
            <p className="mb-1">{word?.definition}</p>
            {word?.notes && (
                <p className="mb-1">
                    <strong>Notes:</strong> {word?.notes}
                </p>
            )}
            <a href={`/collection/${word?.collectionId}`}>
                <small className="text-muted">
                    &#8618; Go to{" "}
                    <span style={{ color: collection?.color }}>
                        <strong>{collection?.name}</strong>
                    </span>{" "}
                    collection
                </small>
            </a>
            <br />
            {word?.createdAt && (
                <small className="text-muted" style={{ fontSize: "12px" }}>
                    Created at {formatDate(word?.createdAt)}
                </small>
            )}

            {isLoading ? (
                <div className="container text-center">Loading...</div>
            ) : synonyms &&
              antonyms &&
              (synonyms.length > 0 || antonyms.length > 0) ? (
                <table
                    className="table table-bordered table-sm mt-2"
                    style={{ borderRadius: "0.25rem" }}
                >
                    <thead>
                        <tr className="text-center">
                            <th scope="col">Synonyms</th>
                            <th scope="col">Antonyms</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center">
                            <td>
                                {synonyms.length > 0 &&
                                    synonyms.map((synonym, index) => (
                                        <div key={index}>
                                            <span
                                                className="synonyms-antonyms"
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                                // data-bs-toggle="offcanvas"
                                                // data-bs-target={`#offcanvas-bottom-synonym-${index}`}
                                                // aria-controls={`offcanvas-bottom-synonym-${index}`}
                                                onClick={() =>
                                                    handleShowOffCanvas(
                                                        `offcanvas-bottom-synonym-${index}`
                                                    )
                                                }
                                            >
                                                {synonym}
                                            </span>

                                            {visibleOffCanvas ===
                                                `offcanvas-bottom-synonym-${index}` && (
                                                <OffCanvas
                                                    id={`offcanvas-bottom-synonym-${index}`}
                                                    word={synonym}
                                                    show={true}
                                                    onClose={() =>
                                                        setVisibleOffCanvas(
                                                            null
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                            </td>
                            <td>
                                {antonyms.length > 0 &&
                                    antonyms.map((antonym, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        >
                                            <span
                                                className="synonyms-antonyms"
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                                // data-bs-toggle="offcanvas"
                                                // data-bs-target={`#offcanvas-bottom-antonym-${index}`}
                                                // aria-controls={`offcanvas-bottom-antonym-${index}`}
                                                onClick={() =>
                                                    handleShowOffCanvas(
                                                        `offcanvas-bottom-antonym-${index}`
                                                    )
                                                }
                                            >
                                                {antonym}
                                            </span>

                                            {visibleOffCanvas ===
                                                `offcanvas-bottom-antonym-${index}` && (
                                                <OffCanvas
                                                    id={`offcanvas-bottom-antonym-${index}`}
                                                    word={antonym}
                                                    show={true}
                                                    onClose={() =>
                                                        setVisibleOffCanvas(
                                                            null
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            ) : null}
        </div>
    );
};
