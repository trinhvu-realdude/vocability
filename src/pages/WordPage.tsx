import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Collection, MyDB, Word } from "../interfaces/model";
import { getWordsByCollectionId } from "../services/WordService";
import initDB from "../utils/database";
import { getCollectionById } from "../services/CollectionService";
import { WordPageProps } from "../interfaces/props";
import { IDBPDatabase } from "idb";
import { SearchBar } from "../components/SearchBar";
import { WordCard } from "../components/Card/WordCard";

export const WordPage: React.FC<WordPageProps> = ({
    words,
    setWords,
    setCurrentCollectionId,
}) => {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();

    const { collectionId } = useParams();
    const [collection, setCollection] = useState<Collection>();
    const [filteredWords, setFilteredWords] = useState<Word[]>(words);

    useEffect(() => {
        const fetchData = async () => {
            const dbInstance = await initDB();
            setDb(dbInstance);
            if (collectionId) {
                setCurrentCollectionId(collectionId);
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

            <SearchBar words={words} setFilteredWords={setFilteredWords} />

            <div className="list-group mt-4">
                {filteredWords && filteredWords.length > 0 ? (
                    filteredWords.map((word) => (
                        <WordCard
                            key={word.id}
                            db={db}
                            word={word}
                            collection={collection}
                            setWords={setWords}
                        />
                    ))
                ) : (
                    <div className="text-center">&#128517; No found word</div>
                )}
            </div>
        </div>
    );
};
