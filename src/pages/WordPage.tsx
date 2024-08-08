import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Collection, MyDB, Word } from "../interfaces/model";
import { getWordsByCollectionId } from "../services/WordService";
import initDB from "../utils/database";
import { getCollectionById } from "../services/CollectionService";
import { FilterSortingOption, WordPageProps } from "../interfaces/props";
import { IDBPDatabase } from "idb";
import { SearchBar } from "../components/SearchBar";
import { WordCard } from "../components/Card/WordCard";
import { EditCollectionModal } from "../components/Modal/EditCollectionModal";

export const WordPage: React.FC<WordPageProps> = ({
    words,
    setWords,
    setCollections,
    setCurrentCollectionId,
}) => {
    const [db, setDb] = useState<IDBPDatabase<MyDB>>();

    const { collectionId } = useParams();
    const [collection, setCollection] = useState<Collection>();
    const [filteredWords, setFilteredWords] = useState<Word[]>(words);
    const [displayWords, setDisplayWords] = useState<Word[]>([]);
    const [filterSorting, setFilterSorting] = useState<FilterSortingOption>();

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
        <div className="collection-list" id="word-list">
            <h4 className="text-center mt-4">
                <span style={{ color: collection?.color }}>
                    <strong>{collection?.name}</strong>
                </span>{" "}
                collection
                <div
                    className="btn btn-sm mx-2"
                    style={{
                        border: "none",
                    }}
                    data-bs-toggle="modal"
                    data-bs-target={`#edit-collection-${collection?.id}`}
                >
                    <i className="fas fa-pen"></i>
                </div>
            </h4>

            <SearchBar
                words={words}
                displayWords={displayWords}
                filterSorting={filterSorting}
                setDisplayWords={setDisplayWords}
                setFilteredWords={setFilteredWords}
                setFilterSorting={setFilterSorting}
            />

            <div className="list-group mt-4">
                {filteredWords && filteredWords.length > 0 ? (
                    filteredWords.map((word) => (
                        <WordCard
                            key={word.id}
                            db={db}
                            word={word}
                            collection={collection}
                            filterSorting={filterSorting}
                            setWords={setWords}
                        />
                    ))
                ) : (
                    <div className="text-center">
                        &#128517; No found word in{" "}
                        <span style={{ color: collection?.color }}>
                            {collection?.name}
                        </span>{" "}
                        collection
                    </div>
                )}
            </div>

            {collection && (
                <EditCollectionModal
                    db={db}
                    collection={collection}
                    setCollection={setCollection}
                    setCollections={setCollections}
                />
            )}
        </div>
    );
};
