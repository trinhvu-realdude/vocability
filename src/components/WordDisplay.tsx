import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Collection, Word } from "../interfaces/interface";
import { getWordsByCollectionId } from "../services/WordService";
import initDB from "../utils/database";
import { findCollectionById } from "../services/CollectionService";

export const WordDisplay = () => {
    const { collectionId } = useParams();

    const [words, setWords] = useState<Word[]>([]);
    const [collection, setCollection] = useState<Collection>();

    useEffect(() => {
        const fetchData = async () => {
            const dbInstance = await initDB();
            if (collectionId) {
                const objCollection = await findCollectionById(
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
            <h4 className="text-center mt-4">{collection?.name} collection</h4>
            <div
                className="accordion"
                id="accordionExample"
            >
                {words &&
                    words.map((word, index) => (
                        <div key={index} className="accordion-item">
                            <h2
                                className="accordion-header"
                                id={`headingWord${word.id}`}
                            >
                                <button
                                    className="accordion-button"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapseWord${word.id}`}
                                    aria-expanded="true"
                                    aria-controls={`collapseWord${word.id}`}
                                >
                                    + {word.word} {`(${word.partOfSpeech}):`}{" "}
                                    {word.definition}
                                </button>
                            </h2>
                            <div
                                id={`collapseWord${word.id}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingWord${word.id}`}
                                data-bs-parent="#accordionExample"
                            >
                                <div className="accordion-body">
                                    {word.notes}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
