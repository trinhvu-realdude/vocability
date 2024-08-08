import React, { useState } from "react";
import { WordCardProps } from "../../interfaces/props";
import { DeleteWordModal } from "../Modal/DeleteWordModal";
import { EditWordModal } from "../Modal/EditWordModal";
import { Word } from "../../interfaces/model";
import {
    addWordToFavorite,
    getWordsByCollectionId,
} from "../../services/WordService";
import {
    formatDate,
    handleTextToSpeech,
    sortWordsByFilter,
} from "../../utils/helper";

export const WordCard: React.FC<WordCardProps> = ({
    db,
    word,
    collection,
    filterSorting,
    setWords,
}) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);

    const handleAddFavorite = async (word: Word) => {
        setIsFavorite(!isFavorite);
        if (db) {
            await addWordToFavorite(db, word, isFavorite);
            if (word.collectionId) {
                const words = await getWordsByCollectionId(
                    db,
                    word.collectionId
                );
                if (filterSorting) {
                    setWords(sortWordsByFilter(words, filterSorting.value));
                } else setWords(words);
            }
        }
    };

    return (
        <div className="list-group-item">
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
                            onClick={() => handleTextToSpeech(word.word)}
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
                            className={`${
                                word.isFavorite ? "fas" : "far"
                            } fa-heart`}
                            onClick={() => handleAddFavorite(word)}
                            style={{ color: `${word.isFavorite ? "red" : ""}` }}
                        ></i>
                    </div>
                    <div
                        className="btn btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target={`#edit-word-${word.id}`}
                    >
                        <i className="fas fa-pen"></i>
                    </div>
                    <div
                        className="btn btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target={`#delete-word-${word.id}`}
                    >
                        <i className="fas fa-times"></i>
                    </div>
                </div>
            </div>
            <p className="mb-1">{word.definition}</p>
            {word.notes && (
                <p className="mb-1">
                    <strong>Notes:</strong> {word.notes}
                </p>
            )}
            <small className="text-muted mb-1" style={{ fontSize: "12px" }}>
                Created at {formatDate(word.createdAt)}
            </small>
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
    );
};
