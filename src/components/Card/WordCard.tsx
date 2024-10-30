import React, { useEffect, useState } from "react";
import { WordCardProps } from "../../interfaces/mainProps";
import { Word } from "../../interfaces/model";
import {
    addWordToFavorite,
    getWordsByCollectionId,
} from "../../services/WordService";
import {
    formatText,
    handleTextToSpeech,
    sortWordsByFilter,
} from "../../utils/helper";
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
    voicesByLanguage,
}) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice>();

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

            const timer = setTimeout(() => {
                setIsBorderVisible(false);
                setSelectedWord(undefined);
            }, 3000); // Border visible for 0.6 seconds

            return () => clearTimeout(timer); // Cleanup the timer if component unmounts or word changes
        }
    }, [selectedWord, word.id]);

    return (
        <>
            {!isEdit && !isDelete && (
                <div
                    className="list-group-item"
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
                        <div className="right px-4">
                            <div className="d-flex justify-content-between mb-2">
                                <div className="text-speech">
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
                                        onClick={() => {
                                            handleTextToSpeech(
                                                word.word,
                                                translations["language"],
                                                selectedVoice
                                            );
                                            setIsAnimating(true);

                                            // Remove the animation class after animation completes
                                            setTimeout(
                                                () => setIsAnimating(false),
                                                600
                                            );
                                        }}
                                    >
                                        <i
                                            className={`fas fa-volume-up ${
                                                isAnimating
                                                    ? "pulse-animation"
                                                    : ""
                                            }`}
                                            style={{
                                                transition:
                                                    "transform 0.6s ease-in-out",
                                            }}
                                        ></i>
                                    </div>
                                    <select
                                        className="btn-sm mx-4"
                                        id="voices-by-language"
                                        style={{ fontSize: "12px" }}
                                        onChange={(event) => {
                                            const voices =
                                                window.speechSynthesis.getVoices();
                                            const voice = voices.find(
                                                (v) =>
                                                    v.name ===
                                                    event.target.value
                                            );
                                            if (voice) setSelectedVoice(voice);
                                        }}
                                    >
                                        {voicesByLanguage &&
                                            voicesByLanguage.map(
                                                (voice, index) => (
                                                    <option
                                                        key={index}
                                                        value={voice.name}
                                                    >
                                                        {!voice.name.includes(
                                                            "Natural"
                                                        )
                                                            ? voice.name
                                                                  .split(" ")[0]
                                                                  .trim()
                                                            : voice.name
                                                                  .split(" ")[1]
                                                                  .trim()}
                                                        {` (${voice.lang})`}
                                                    </option>
                                                )
                                            )}
                                    </select>
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

                            <p className="mb-2">{word.definition}</p>
                            {word.notes && (
                                <p className="mb-2">
                                    <strong>
                                        {translations["addWordForm.notes"]}:
                                    </strong>{" "}
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: formatText(word.notes),
                                        }}
                                    ></span>
                                </p>
                            )}
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
                    </div>
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
