import { useEffect } from "react";
import { Collection, MyDB, Word } from "../interfaces/model";
import { useLanguage } from "../LanguageContext";
import { IDBPDatabase } from "idb";
import { useParams } from "react-router-dom";
import { getWordsByCollectionId } from "../services/WordService";
import { TextToSpeechButton } from "./TextToSpeechButton";

export const LeftOffCanvas: React.FC<{
    db: IDBPDatabase<MyDB>;
    collection: Collection | undefined;
    words: Word[];
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}> = ({ db, collection, words, setWords }) => {
    const { setSelectedWord } = useLanguage();

    const { collectionId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            if (collectionId) {
                const updatedWords = await getWordsByCollectionId(
                    db,
                    Number.parseInt(collectionId)
                );
                setWords(updatedWords);
            }
        };
        fetchData();
    }, [words.length]);

    return (
        <div
            className="offcanvas offcanvas-start"
            tabIndex={-1}
            id="offcanvasWithBackdrop"
            aria-labelledby="offcanvasWithBackdropLabel"
        >
            <div className="offcanvas-header" style={{backgroundColor: collection?.color, color: "#fff"}}>
                <h5 className="offcanvas-title" id="offcanvasWithBackdropLabel">
                    <span>
                        <strong>{collection?.name}</strong>
                    </span>
                </h5>
                <div
                    className="btn btn-sm"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                    style={{color: "#fff"}}
                >
                    <i className="fas fa-times"></i>
                </div>
            </div>
            <div className="offcanvas-body">
                <ul className="list-group">
                    <p>List of words</p>
                    {words.length > 0 &&
                        words.map((word, index) => (
                            <li
                                className="list-group-item d-flex justify-content-between"
                                key={index}
                            >
                                <a
                                    className="word-link"
                                    href={`#${word.id}`}
                                    data-bs-dismiss="offcanvas"
                                    aria-label="Close"
                                    key={index}
                                    onClick={() => setSelectedWord(word)}
                                >
                                    {index + 1}. {word.word}
                                </a>
                                <TextToSpeechButton word={word.word} />
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};
