import React, { useState } from "react";
import { WordCardProps } from "../../interfaces/mainProps";
import { Word } from "../../interfaces/model";
import {
    addWordToFavorite,
    getWordsByCollectionId,
} from "../../services/WordService";
import { handleTextToSpeech, sortWordsByFilter } from "../../utils/helper";
import { EditWordForm } from "../Form/EditWordForm";
import { DeleteWordForm } from "../Form/DeleteWordForm";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";

const ButtonGroup: React.FC<{
    word: Word;
    handleAddFavorite: (word: Word) => Promise<void>;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ word, handleAddFavorite, setIsEdit, setIsDelete }) => {
    return (
        <>
            <div className="btn btn-sm">
                <i
                    className={`${word.isFavorite ? "fas" : "far"} fa-bookmark`}
                    onClick={() => handleAddFavorite(word)}
                    style={{
                        color: `${word.isFavorite ? "#FFC000" : ""}`,
                    }}
                ></i>
            </div>
            <div className="btn btn-sm" onClick={() => setIsEdit(true)}>
                <i className="fas fa-pen"></i>
            </div>
            <div className="btn btn-sm" onClick={() => setIsDelete(true)}>
                <i className="fas fa-times"></i>
            </div>
        </>
    );
};

export const WordCard: React.FC<WordCardProps> = ({
    db,
    word,
    collection,
    filterSorting,
    setWords,
}) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);

    const { translations } = useLanguage();

    const handleAddFavorite = async (word: Word) => {
        setIsFavorite(!isFavorite);
        if (db) {
            await addWordToFavorite(db, word, isFavorite);
            if (word.collectionId) {
                const words = await getWordsByCollectionId(
                    db,
                    word.collectionId
                );
                if (filterSorting)
                    setWords(sortWordsByFilter(words, filterSorting.value));
                else setWords(words);
            }
        }
    };

    return (
        <>
            {!isEdit && !isDelete && (
                <div className="list-group-item">
                    <div className="d-flex w-100 justify-content-between mb-2">
                        <div className="row">
                            <h5 className="mb-1">
                                <a
                                    href={`/${translations["language"]}/word/${word.id}`}
                                    className="word-link"
                                >
                                    <strong>{word.word}</strong>{" "}
                                </a>
                                <small
                                    className="text-muted mb-1"
                                    style={{ fontSize: "14px" }}
                                >
                                    {word.phonetic}
                                </small>{" "}
                                <div
                                    className="btn btn-sm"
                                    style={{
                                        padding: 0,
                                        margin: 0,
                                    }}
                                    onClick={() =>
                                        handleTextToSpeech(
                                            word.word,
                                            translations["language"]
                                        )
                                    }
                                >
                                    <i className="fas fa-volume-up"></i>
                                </div>
                            </h5>
                            <small>
                                <i>{word.partOfSpeech}</i>
                            </small>
                        </div>
                        <div className="function-buttons">
                            <ButtonGroup
                                word={word}
                                handleAddFavorite={handleAddFavorite}
                                setIsEdit={setIsEdit}
                                setIsDelete={setIsDelete}
                            />
                        </div>
                        <div className="dropdown three-dots">
                            <i
                                className="fa fa-ellipsis-v"
                                style={{ cursor: "pointer", fontSize: "14px" }}
                                id="dropdown-three-buttons"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            ></i>
                            <ul
                                className="dropdown-menu"
                                aria-labelledby="dropdown-three-buttons"
                            >
                                <li className="d-flex justify-content-between px-3">
                                    <ButtonGroup
                                        word={word}
                                        handleAddFavorite={handleAddFavorite}
                                        setIsEdit={setIsEdit}
                                        setIsDelete={setIsDelete}
                                    />
                                </li>
                            </ul>
                        </div>
                    </div>
                    <p className="mb-1">{word.definition}</p>
                    {word.notes && (
                        <p className="mb-1">
                            <strong>
                                {translations["addWordForm.notes"]}:
                            </strong>{" "}
                            {word.notes}
                        </p>
                    )}
                    <small
                        className="text-muted mb-1"
                        style={{ fontSize: "12px" }}
                    >
                        {translations["createdAt"]}{" "}
                        {formatDate(word.createdAt, translations["language"])}
                    </small>
                </div>
            )}

            {isEdit && (
                <EditWordForm
                    db={db}
                    word={word}
                    collection={collection}
                    setIsEditOrDelete={setIsEdit}
                    setWords={setWords}
                />
            )}

            {isDelete && (
                <DeleteWordForm
                    db={db}
                    word={word}
                    collection={collection}
                    setIsEditOrDelete={setIsDelete}
                    setWords={setWords}
                />
            )}
        </>
    );
};
