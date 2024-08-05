import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Collection, MyDB } from "../interfaces/model";
import { getWordsByCollectionId } from "../services/WordService";
import initDB from "../utils/database";
import { getCollectionById } from "../services/CollectionService";
import { WordDisplayProps } from "../interfaces/props";
import { IDBPDatabase } from "idb";
import { DeleteWordModal } from "./Modal/DeleteWordModal";
import { EditWordModal } from "./Modal/EditWordModal";

export const WordDisplay: React.FC<WordDisplayProps> = ({
    words,
    setWords,
}) => {
    const { collectionId } = useParams();

    const [collection, setCollection] = useState<Collection>();
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();

    useEffect(() => {
        const fetchData = async () => {
            const dbInstance = await initDB();
            setDb(dbInstance);
            if (collectionId) {
                const objCollection = await getCollectionById(
                    dbInstance,
                    Number.parseInt(collectionId)
                );
                setCollection(objCollection);
                const objWord = await getWordsByCollectionId(
                    dbInstance,
                    Number.parseInt(collectionId)
                );
                setWords(objWord);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="word-list" id="word-list">
            <h4 className="text-center mt-4">
                <span style={{ color: collection?.color }}>
                    <strong>{collection?.name}</strong>
                </span>{" "}
                collection
            </h4>

            <div className="list-group mt-4">
                {words && words.length > 0 ? (
                    words.map((word, index) => (
                        <div className="list-group-item" key={word.id || index}>
                            <div className="d-flex w-100 justify-content-between mb-2">
                                <div className="row">
                                    <h5 className="mb-1">
                                        <strong>{word.word}</strong>
                                    </h5>
                                    <small>
                                        <i>{word.partOfSpeech}</i>
                                    </small>
                                </div>
                                <div>
                                    <button
                                        className="btn btn-sm"
                                        data-bs-toggle="modal"
                                        data-bs-target={`#edit-word-${word.id}`}
                                    >
                                        <i className="fas fa-pen"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        data-bs-toggle="modal"
                                        data-bs-target={`#delete-word-${word.id}`}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            <p className="mb-1">{word.definition}</p>
                            {word.notes && (
                                <p className="mb-1">
                                    <strong>Notes:</strong> {word.notes}
                                </p>
                            )}
                            <DeleteWordModal
                                db={db}
                                word={word}
                                collection={collection}
                                setWords={setWords}
                            />
                            <EditWordModal
                                db={db}
                                word={word}
                                collection={collection}
                                setWords={setWords}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center">
                        &#128517; No word in collection.
                    </div>
                )}
            </div>
        </div>
    );
};
