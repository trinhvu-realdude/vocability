import React, { useEffect, useState } from "react";
import { WordCardProps } from "../../interfaces/mainProps";
import { Word } from "../../interfaces/model";
import {
    addWordToFavorite,
    getWordsByCollectionId,
} from "../../services/WordService";
import { formatText, sortWordsByFilter } from "../../utils/helper";
import { EditWordForm } from "../Form/EditWordForm";
import { DeleteWordForm } from "../Form/DeleteWordForm";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";
import { TextToSpeechButton } from "../TextToSpeechButton";
import "../../styles/WordCard.css";

const ButtonGroup: React.FC<{
    word: Word;
    handleAddFavorite: (word: Word) => Promise<void>;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ word, handleAddFavorite, setIsEdit, setIsDelete }) => {
    return (
        <>
            <div className="btn btn-sm" title="Add Favorite">
                <i
                    className={`${word.isFavorite ? "fas" : "far"} fa-star`}
                    onClick={() => handleAddFavorite(word)}
                    style={{
                        color: `${word.isFavorite ? "#FFC000" : ""}`,
                    }}
                ></i>
            </div>
            <div className="btn btn-sm" title="Edit Word" onClick={() => setIsEdit(true)}>
                <i className="fas fa-pen"></i>
            </div>
            <div className="btn btn-sm" title="Delete Word" onClick={() => setIsDelete(true)}>
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
    onShowToast,
    isHideDefinition,
}) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    useEffect(() => {
        if (isHideDefinition) {
            setIsRevealed(false);
        }
    }, [isHideDefinition]);

    const { translations, selectedWord, setSelectedWord } = useLanguage();

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

    const [isBorderVisible, setIsBorderVisible] = useState(false);

    useEffect(() => {
        if (selectedWord && selectedWord.id === word.id) {
            setIsBorderVisible(true);

            // Scroll element into view
            const element = document.getElementById(new String(word.id).toString());
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }

            const timer = setTimeout(() => {
                setIsBorderVisible(false);
                setSelectedWord(undefined);
            }, 1000);

            return () => clearTimeout(timer); // Cleanup the timer if component unmounts or word changes
        }
    }, [selectedWord, word.id]);

    return (
        <>
            {!isEdit && !isDelete && (
                <div
                    className="list-group-item word-card-hover p-4"
                    id={new String(word.id).toString()}
                    style={{
                        border: isBorderVisible
                            ? `2px dashed ${collection?.color}`
                            : "",
                    }}
                >
                    <div className="d-flex w-100 justify-content-between">
                        <div
                            className="left px-1"
                            style={{
                                borderRight: "1px solid rgba(0, 0, 0, .125)",
                            }}
                        >
                            <h5>
                                <a
                                    href={`/${translations["language"]}/word/${word.id}`}
                                    className="word-link"
                                    style={{
                                        backgroundColor: word.isFavorite
                                            ? "#FFC000"
                                            : "",
                                    }}
                                >
                                    <strong>{word.word}</strong>{" "}
                                </a>
                            </h5>
                            <small>
                                <i>{word.partOfSpeech}</i>
                            </small>
                        </div>
                        <div className="right px-4" style={{ position: 'relative' }}>
                            <div className={`word-card-right-content ${isHideDefinition && !isRevealed ? 'content-blurred' : ''}`}>
                                <div className="d-flex justify-content-between mb-2">
                                    <div className="text-speech d-flex align-items-center gap-2">
                                        <small
                                            className="text-muted"
                                            style={{ fontSize: "14px" }}
                                        >
                                            {word.phonetic}
                                        </small>
                                        <TextToSpeechButton word={word.word} />
                                    </div>
                                    <div className="function-buttons word-actions">
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
                                            style={{
                                                cursor: "pointer",
                                                fontSize: "14px",
                                            }}
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
                                                    handleAddFavorite={
                                                        handleAddFavorite
                                                    }
                                                    setIsEdit={setIsEdit}
                                                    setIsDelete={setIsDelete}
                                                />
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <ul className="list-group list-group-flush">
                                    {/* Multiple definitions view */}
                                    {word.definitions &&
                                        word.definitions.map(
                                            (definition, index) => (
                                                <li
                                                    key={index}
                                                    className="list-group-item"
                                                >
                                                    <p className="mb-2">
                                                        {definition.definition.trim()}
                                                    </p>
                                                    {definition.notes && (
                                                        <p className="mb-2">
                                                            <strong>
                                                                {
                                                                    translations[
                                                                    "addWordForm.notes"
                                                                    ]
                                                                }
                                                                :
                                                            </strong>{" "}
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: formatText(
                                                                        definition.notes.trim()
                                                                    ),
                                                                }}
                                                            ></span>
                                                        </p>
                                                    )}
                                                </li>
                                            )
                                        )}
                                </ul>
                                <small
                                    className="text-muted mb-2"
                                    style={{ fontSize: "12px" }}
                                >
                                    {translations["createdAt"]}{" "}
                                    {formatDate(
                                        word.createdAt,
                                        translations["language"]
                                    )}
                                </small>
                            </div>

                            {/* Overlay Button */}
                            {isHideDefinition && !isRevealed && (
                                <div className="word-card-overlay">
                                    <button
                                        className="btn btn-show-definition"
                                        onClick={() => setIsRevealed(true)}
                                    >
                                        <i className="fas fa-eye" style={{ color: '#DD5746' }}></i>
                                        {translations["showDefinition"] || "Show definition"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isEdit && (
                <EditWordForm
                    key={`edit-${word.id}-${isEdit}`}
                    db={db}
                    word={word}
                    collection={collection}
                    setIsEditOrDelete={setIsEdit}
                    setWords={setWords}
                    onShowToast={onShowToast}
                />
            )}

            {isDelete && (
                <DeleteWordForm
                    db={db}
                    word={word}
                    collection={collection}
                    setIsEditOrDelete={setIsDelete}
                    setWords={setWords}
                    onShowToast={onShowToast}
                />
            )}
        </>
    );
};
