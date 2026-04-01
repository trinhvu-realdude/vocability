import React, { useEffect, useState } from "react";
import { WordCardProps } from "../../interfaces/mainProps";
import { Word } from "../../interfaces/model";
import {
    addWordToFavorite,
} from "../../services/WordService";
import { formatText } from "../../utils/helper";
import { EditWordModal } from "../Modal/EditWordModal";
import { DeleteWordModal } from "../Modal/DeleteWordModal";
import { formatDate } from "../../utils/formatDateString";
import { useLanguage } from "../../LanguageContext";
import { TextToSpeechButton } from "../TextToSpeechButton";
import { usePermissions } from "../../utils/usePermissions";
import "../../styles/WordCard.css";

const ButtonGroup: React.FC<{
    word: Word;
    handleAddFavorite: (word: Word) => Promise<void>;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>;
    canEdit: boolean;
    canDelete: boolean;
    canFavorite: boolean;
}> = ({ word, handleAddFavorite, setIsEdit, setIsDelete, canEdit, canDelete, canFavorite }) => {
    return (
        <>
            {canFavorite && (
                <div className="btn btn-sm" title="Add Favorite">
                    <i
                        className={`${word.is_favorite ? "fas" : "far"} fa-star`}
                        onClick={() => handleAddFavorite(word)}
                        style={{
                            color: `${word.is_favorite ? "#FFC000" : ""}`,
                        }}
                    ></i>
                </div>
            )}
            {canEdit && (
                <div className="btn btn-sm" title="Edit Word" onClick={() => setIsEdit(true)}>
                    <i className="fas fa-pen"></i>
                </div>
            )}
            {canDelete && (
                <div className="btn btn-sm" title="Delete Word" onClick={() => setIsDelete(true)}>
                    <i className="fas fa-times"></i>
                </div>
            )}
        </>
    );
};

export const WordCard: React.FC<WordCardProps> = ({
    word,
    collection,
    setWords,
    onShowToast,
    isHideDefinition,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    useEffect(() => {
        if (isHideDefinition) {
            setIsRevealed(false);
        }
    }, [isHideDefinition]);

    const { translations, selectedWord, setSelectedWord } = useLanguage();
    const { canEdit, canDelete, canFavorite } = usePermissions(collection?.id);

    const handleAddFavorite = async (word: Word) => {
        const newFavoriteStatus = !word.is_favorite;

        // Optimistic UI update
        if (setWords) {
            setWords((prevWords: Word[]) => {
                if (!prevWords) return prevWords;
                return prevWords.map(w => w.id === word.id ? { ...w, is_favorite: newFavoriteStatus } : w);
            });
        }

        try {
            await addWordToFavorite(word, newFavoriteStatus);
        } catch (error) {
            // Revert on failure
            if (setWords) {
                setWords((prevWords: Word[]) => {
                    if (!prevWords) return prevWords;
                    return prevWords.map(w => w.id === word.id ? { ...w, is_favorite: !newFavoriteStatus } : w);
                });
            }
            onShowToast?.("Failed to update favorite status", "error");
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
                                    backgroundColor: word.is_favorite
                                        ? "#FFC000"
                                        : "",
                                }}
                            >
                                <strong>{word.word}</strong>{" "}
                            </a>
                        </h5>
                        <small>
                            <i>{word.part_of_speech}</i>
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
                                        canEdit={canEdit}
                                        canDelete={canDelete}
                                        canFavorite={canFavorite}
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
                                                canEdit={canEdit}
                                                canDelete={canDelete}
                                                canFavorite={canFavorite}
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
                                {word.created_at && formatDate(
                                    new Date(word.created_at),
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
                                    {translations["showDefinition"]}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isEdit && (
                <EditWordModal
                    key={`edit-${word.id}-${isEdit}`}
                    word={word}
                    collection={collection}
                    setIsEditOrDelete={setIsEdit}
                    setWords={setWords}
                    onShowToast={onShowToast}
                />
            )}

            {isDelete && (
                <DeleteWordModal
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
