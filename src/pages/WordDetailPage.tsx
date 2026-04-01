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
import { formatText } from "../utils/helper";
import { getCollectionById } from "../services/CollectionService";
import { OffCanvas } from "../components/BottomOffCanvas";
import { APP_NAME } from "../utils/constants";
import { EditWordForm } from "../components/Form/EditWordForm";
import { useLanguage } from "../LanguageContext";
import { TextToSpeechButton } from "../components/TextToSpeechButton";
import { usePermissions } from "../utils/usePermissions";
import "../styles/WordDetailPage.css";

export const WordDetailPage: React.FC<WordDetailPageProps> = ({ onShowToast }) => {
    const { wordId } = useParams();

    const [word, setWord] = useState<Word>();
    const [collection, setCollection] = useState<Collection>();
    const [synonyms, setSynonyms] = useState<string[]>();
    const [antonyms, setAntonyms] = useState<string[]>();

    const [visibleOffCanvas, setVisibleOffCanvas] = useState<string | null>(
        null
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const { translations } = useLanguage();
    const { canEdit } = usePermissions(collection?.id);

    if (translations)
        document.title = `${translations["flag"]} ${word?.word} | ${APP_NAME}`;

    const handleAddFavorite = async (wordToUpdate: Word) => {
        const newFavoriteStatus = !wordToUpdate.is_favorite;

        // Optimistic UI update for instant feedback
        setWord({ ...wordToUpdate, is_favorite: newFavoriteStatus });

        try {
            await addWordToFavorite(wordToUpdate, newFavoriteStatus);
        } catch (error) {
            console.error("Failed to favorite word:", error);
            // Revert on error
            setWord({ ...wordToUpdate, is_favorite: !newFavoriteStatus });
        }
    };

    useEffect(() => {
        const fetchWord = async () => {
            try {
                if (wordId) {
                    const objWord = await getWordById(wordId);
                    if (objWord?.collection_id) {
                        const objCollection = await getCollectionById(
                            objWord.collection_id
                        );
                        setCollection(objCollection);
                    }
                    if (objWord) {
                        setWord(objWord);
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
                content={
                    <>
                        <strong>{word?.word}</strong>
                    </>
                }
            />
            {!isEdit && !isLoading && (
                <>
                    <div className="d-flex w-100 justify-content-between mb-2">
                        <div className="row">
                            <h5 className="mb-1 d-flex align-items-center gap-2">
                                <strong>{word?.word}</strong>{" "}
                                <small
                                    className="text-muted"
                                    style={{ fontSize: "14px" }}
                                >
                                    {word?.phonetic}
                                </small>{" "}
                                <TextToSpeechButton word={word?.word || ""} />
                            </h5>
                            <small>
                                <i>{word?.part_of_speech}</i>
                            </small>
                        </div>
                        <div className="word-action">
                            {canEdit && (
                                <div className="btn btn-sm" title="Add Favorite">
                                    <i
                                        className={`${word?.is_favorite ? "fas" : "far"
                                            } fa-star`}
                                        onClick={() => {
                                            if (word) handleAddFavorite(word);
                                        }}
                                        style={{
                                            color: `${word?.is_favorite ? "#FFC000" : ""
                                                }`,
                                        }}
                                    ></i>
                                </div>
                            )}
                        </div>
                    </div>

                    <ul className="list-group list-group-flush">
                        {/* Multiple definitions view */}
                        {word?.definitions &&
                            word?.definitions.map((definition, index) => (
                                <li key={index} className="list-group-item">
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
                            ))}
                    </ul>

                    <a
                        href={`/${translations["language"]}/collection/${word?.collection_id}`}
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
                    {word?.created_at && (
                        <small
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                        >
                            {translations["createdAt"]}{" "}
                            {formatDate(
                                new Date(word.created_at),
                                translations["language"]
                            )}
                        </small>
                    )}
                </>
            )}

            {isEdit && word && (
                <EditWordForm
                    word={word}
                    collection={collection}
                    setIsEditOrDelete={setIsEdit}
                    setWords={() => { }}
                    setWord={setWord}
                    setSynonyms={setSynonyms}
                    setAntonyms={setAntonyms}
                    onShowToast={onShowToast}
                />
            )}

            {isLoading ? (
                <div className="mx-auto loader"></div>
            ) : synonyms &&
                antonyms &&
                (synonyms.length > 0 || antonyms.length > 0) ? (
                <div className="synonyms-antonyms-container mt-4">
                    {synonyms.length > 0 && (
                        <div className="sa-section">
                            <h6 className="sa-title synonyms-title">
                                Synonyms
                            </h6>
                            <div className="sa-badges">
                                {synonyms.map((synonym, index) => (
                                    <div key={`synonym-${index}`}>
                                        <span
                                            className="sa-badge sa-synonym"
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
                                                    onClose={() => setVisibleOffCanvas(null)}
                                                />
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {antonyms.length > 0 && (
                        <div className="sa-section mt-3">
                            <h6 className="sa-title antonyms-title">
                                Antonyms
                            </h6>
                            <div className="sa-badges">
                                {antonyms.map((antonym, index) => (
                                    <div key={`antonym-${index}`}>
                                        <span
                                            className="sa-badge sa-antonym"
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
                                                    onClose={() => setVisibleOffCanvas(null)}
                                                />
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};
