import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Collection, Word } from "../interfaces/model";
import { useParams } from "react-router-dom";
import {
    addWordToFavorite,
    getSynonymsAntonyms,
    getWordById,
} from "../services/WordService";
import { WordDetailPageProps } from "../interfaces/mainProps";
import { formatDate } from "../utils/formatDateString";
import {
    formatText,
    getVoicesByLanguage,
    handleTextToSpeech,
} from "../utils/helper";
import { getCollectionById } from "../services/CollectionService";
import { OffCanvas } from "../components/BottomOffCanvas";
import { APP_NAME } from "../utils/constants";
import { EditWordForm } from "../components/Form/EditWordForm";
import { useLanguage } from "../LanguageContext";

export const WordDetailPage: React.FC<WordDetailPageProps> = ({ db }) => {
    const { wordId } = useParams();

    const [word, setWord] = useState<Word>();
    const [collection, setCollection] = useState<Collection>();
    const [synonyms, setSynonyms] = useState<string[]>();
    const [antonyms, setAntonyms] = useState<string[]>();

    const [visibleOffCanvas, setVisibleOffCanvas] = useState<string | null>(
        null
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [voicesByLanguage, setVoicesByLanguage] = useState<
        SpeechSynthesisVoice[]
    >([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice>();
    const [isAnimating, setIsAnimating] = useState(false);

    const { translations } = useLanguage();

    if (translations)
        document.title = `${translations["flag"]} ${APP_NAME} | ${word?.word}`;

    const handleAddFavorite = async (word: Word) => {
        setIsFavorite(!isFavorite);
        if (db) {
            await addWordToFavorite(db, word, isFavorite);
            if (word.id) {
                const updatedWord = await getWordById(db, word.id);
                setWord(updatedWord);
            }
        }
    };

    useEffect(() => {
        const fetchWord = async () => {
            try {
                if (db && wordId) {
                    const objWord = await getWordById(
                        db,
                        Number.parseInt(wordId)
                    );
                    if (objWord?.collectionId) {
                        const objCollection = await getCollectionById(
                            db,
                            objWord?.collectionId
                        );
                        setCollection(objCollection);
                    }
                    if (objWord) {
                        setWord(objWord);
                        setVoicesByLanguage(
                            await getVoicesByLanguage(translations["language"])
                        );
                        const objSynonymsAntonyms = await getSynonymsAntonyms(
                            objWord
                        );

                        setSynonyms(objSynonymsAntonyms?.synonyms);
                        setAntonyms(objSynonymsAntonyms?.antonyms);
                    }
                }
            } catch (error) {
                console.log(error);
                setSynonyms([]);
                setAntonyms([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchWord();
    }, [isEdit ? word?.word : null, translations["language"]]);

    const handleShowOffCanvas = async (id: string) => {
        setVisibleOffCanvas(id);
    };

    return (
        <div className="container-list" id="word-detail">
            <PageHeader
                href={`/${translations["language"]}/collection/${word?.collectionId}`}
                content={
                    <>
                        <strong>{word?.word}</strong>
                    </>
                }
            />
            {!isEdit && (
                <>
                    <div className="d-flex w-100 justify-content-between mb-2">
                        <div className="row">
                            <h5 className="mb-1">
                                <strong>{word?.word}</strong>{" "}
                                <small
                                    className="text-muted mb-1"
                                    style={{ fontSize: "14px" }}
                                >
                                    {word?.phonetic}
                                </small>{" "}
                                <div
                                    className="btn btn-sm"
                                    style={{
                                        padding: 0,
                                        margin: 0,
                                    }}
                                    onClick={() => {
                                        {
                                            word?.word &&
                                                handleTextToSpeech(
                                                    word.word,
                                                    translations["language"],
                                                    selectedVoice
                                                );
                                        }
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
                                            isAnimating ? "pulse-animation" : ""
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
                                            (v) => v.name === event.target.value
                                        );
                                        if (voice) setSelectedVoice(voice);
                                    }}
                                >
                                    {voicesByLanguage &&
                                        voicesByLanguage.map((voice, index) => (
                                            <option
                                                key={index}
                                                value={voice.name}
                                            >
                                                {!voice.name.includes("Natural")
                                                    ? voice.name
                                                          .split(" ")[0]
                                                          .trim()
                                                    : voice.name
                                                          .split(" ")[1]
                                                          .trim()}
                                                {` (${voice.lang})`}
                                            </option>
                                        ))}
                                </select>
                            </h5>
                            <small>
                                <i>{word?.partOfSpeech}</i>
                            </small>
                        </div>
                        <div>
                            <div className="btn btn-sm">
                                <i
                                    className={`${
                                        word?.isFavorite ? "fas" : "far"
                                    } fa-bookmark`}
                                    onClick={() => {
                                        if (word) handleAddFavorite(word);
                                    }}
                                    style={{
                                        color: `${
                                            word?.isFavorite ? "#FFC000" : ""
                                        }`,
                                    }}
                                ></i>
                            </div>
                            {/* <div
                                className="btn btn-sm"
                                onClick={() => setIsEdit(true)}
                            >
                                <i className="fas fa-pen"></i>
                            </div> */}
                        </div>
                    </div>
                    <p className="mb-1">{word?.definition}</p>
                    {word?.notes && (
                        <p className="mb-1">
                            <strong>Notes:</strong>{" "}
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: formatText(word.notes),
                                }}
                            ></span>
                        </p>
                    )}
                    <a
                        href={`/${translations["language"]}/collection/${word?.collectionId}`}
                    >
                        <small className="text-muted">
                            &#8618; {translations["goTo"]}{" "}
                            <span style={{ color: collection?.color }}>
                                <strong>{collection?.name}</strong>
                            </span>{" "}
                            {new String(
                                translations["addWordForm.collection"]
                            ).toLowerCase()}
                        </small>
                    </a>
                    <br />
                    {word?.createdAt && (
                        <small
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                        >
                            {translations["createdAt"]}{" "}
                            {formatDate(
                                word?.createdAt,
                                translations["language"]
                            )}
                        </small>
                    )}
                </>
            )}

            {isEdit && word && (
                <EditWordForm
                    db={db}
                    word={word}
                    collection={collection}
                    setIsEditOrDelete={setIsEdit}
                    setWords={() => {}}
                    setWord={setWord}
                    setSynonyms={setSynonyms}
                    setAntonyms={setAntonyms}
                />
            )}

            {isLoading ? (
                <div className="mx-auto loader"></div>
            ) : synonyms &&
              antonyms &&
              (synonyms.length > 0 || antonyms.length > 0) ? (
                <table
                    className="table table-bordered table-sm mt-2"
                    style={{ borderRadius: "0.25rem" }}
                >
                    <thead>
                        <tr className="text-center">
                            <th scope="col">Synonyms</th>
                            <th scope="col">Antonyms</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center">
                            <td>
                                {synonyms.length > 0 &&
                                    synonyms.map((synonym, index) => (
                                        <div key={index}>
                                            <span
                                                className="synonyms-antonyms"
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    handleShowOffCanvas(
                                                        `offcanvas-bottom-synonym-${index}`
                                                    )
                                                }
                                            >
                                                {synonym}
                                            </span>

                                            {visibleOffCanvas ===
                                                `offcanvas-bottom-synonym-${index}` && (
                                                <OffCanvas
                                                    id={`offcanvas-bottom-synonym-${index}`}
                                                    word={synonym}
                                                    show={true}
                                                    onClose={() =>
                                                        setVisibleOffCanvas(
                                                            null
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                            </td>
                            <td>
                                {antonyms.length > 0 &&
                                    antonyms.map((antonym, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                cursor: "pointer",
                                            }}
                                        >
                                            <span
                                                className="synonyms-antonyms"
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                    handleShowOffCanvas(
                                                        `offcanvas-bottom-antonym-${index}`
                                                    )
                                                }
                                            >
                                                {antonym}
                                            </span>

                                            {visibleOffCanvas ===
                                                `offcanvas-bottom-antonym-${index}` && (
                                                <OffCanvas
                                                    id={`offcanvas-bottom-antonym-${index}`}
                                                    word={antonym}
                                                    show={true}
                                                    onClose={() =>
                                                        setVisibleOffCanvas(
                                                            null
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            ) : null}
        </div>
    );
};
