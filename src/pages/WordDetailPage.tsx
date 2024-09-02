import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Word } from "../interfaces/model";
import { useParams } from "react-router-dom";
import { getSynonymsAntonyms, getWordById } from "../services/WordService";
import { WordDetailPageProps } from "../interfaces/mainProps";
import { formatDate } from "../utils/formatDateString";
import { handleTextToSpeech } from "../utils/helper";

export const WordDetailPage: React.FC<WordDetailPageProps> = ({ db }) => {
    const { wordId } = useParams();

    const [word, setWord] = useState<Word>();
    const [synonyms, setSynonyms] = useState<string[]>();
    const [antonyms, setAntonyms] = useState<string[]>();

    useEffect(() => {
        const fetchWord = async () => {
            if (db && wordId) {
                const data = await getWordById(db, Number.parseInt(wordId));
                if (data) {
                    const objSynonymsAntonyms = await getSynonymsAntonyms(data);
                    setSynonyms(objSynonymsAntonyms?.synonyms);
                    setAntonyms(objSynonymsAntonyms?.antonyms);
                    setWord(data);
                }
            }
        };
        fetchWord();
    }, []);
    return (
        <div className="container-list" id="word-detail">
            <PageHeader
                href={`/collection/${word?.collectionId}`}
                content={
                    <>
                        <strong>{word?.word}</strong>
                    </>
                }
            />
            <div className="d-flex w-100 justify-content-between mb-2">
                <div className="row">
                    <h5 className="mb-1">
                        <a href={`/word/${word?.id}`} className="word-link">
                            <strong>{word?.word}</strong>{" "}
                        </a>
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
                            onClick={() =>
                                word?.word && handleTextToSpeech(word?.word)
                            }
                        >
                            <i className="fas fa-volume-up"></i>
                        </div>
                    </h5>
                    <small>
                        <i>{word?.partOfSpeech}</i>
                    </small>
                </div>
            </div>
            <p className="mb-1">{word?.definition}</p>
            {word?.notes && (
                <p className="mb-1">
                    <strong>Notes:</strong> {word?.notes}
                </p>
            )}
            {synonyms && antonyms && (
                <table className="table">
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
                                        <div key={index}>{synonym}</div>
                                    ))}
                            </td>
                            <td>
                                {antonyms.length > 0 &&
                                    antonyms.map((antonym, index) => (
                                        <div key={index}>{antonym}</div>
                                    ))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            )}
            {word?.createdAt && (
                <small className="text-muted mb-1" style={{ fontSize: "12px" }}>
                    Created at {formatDate(word?.createdAt)}
                </small>
            )}
        </div>
    );
};
