import { useEffect, useState } from "react";
import { ExternalWord } from "../interfaces/mainProps";
import { getExternalWord } from "../services/WordService";
import { TextToSpeechButton } from "./TextToSpeechButton";

export const OffCanvas: React.FC<{
    id: string;
    word: string;
    show: boolean;
    onClose: any;
}> = ({ id, word, show, onClose }) => {
    const [data, setData] = useState<ExternalWord | { message: string }>();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            const objExternalWord = await getExternalWord(word);
            setData(objExternalWord);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div
            className={`offcanvas offcanvas-bottom ${show ? "show" : ""}`}
            tabIndex={-1}
            id={id}
            aria-labelledby={`offcanvas-bottom-${word}-label`}
            style={{
                height: `${data && "entries" in data ? "100%" : "20%"}`,
                visibility: show ? "visible" : "hidden",
                transition: "visibility 0.3s ease, height 0.3s ease",
                backgroundColor: "#fcfcfc",
            }}
        >
            <div className="offcanvas-header">
                <h5
                    className="offcanvas-title w-100 text-center"
                    id={`offcanvas-bottom-${word}-label`}
                >
                    <strong>{word}</strong>
                </h5>
                {!isLoading && (
                    <div
                        className="btn btn-sm"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </div>
                )}
            </div>
            <div className="offcanvas-body text-start container">
                {isLoading ? (
                    <div className="mx-auto loader"></div>
                ) : data && "entries" in data && data.entries ? (
                    <div className="d-flex w-100 justify-content-between mb-2">
                        <div className="row w-100">
                            <h5 className="mb-1 d-flex align-items-center gap-2">
                                <strong>{data.word}</strong>
                                <TextToSpeechButton word={data.word} />
                            </h5>
                            {data.entries.map((entry, index) => (
                                <div key={index} className="mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <small>
                                            <i>{entry.partOfSpeech}</i>
                                        </small>
                                        <small
                                            className="text-muted"
                                            style={{ fontSize: "14px" }}
                                        >
                                            {entry.pronunciations &&
                                                entry.pronunciations.length >
                                                    0 &&
                                                entry.pronunciations[0].text}
                                        </small>
                                    </div>
                                    <div className="mx-2">
                                        <ul className="list-group list-group-flush">
                                            {entry.senses &&
                                                entry.senses.map(
                                                    (sense, sIndex) => (
                                                        <li
                                                            className="list-group-item"
                                                            key={sIndex}
                                                        >
                                                            <p>
                                                                {
                                                                    sense.definitions
                                                                }
                                                            </p>
                                                            {sense.examples &&
                                                                sense.examples
                                                                    .length >
                                                                    0 && (
                                                                    <p>
                                                                        <strong>
                                                                            Example:
                                                                        </strong>{" "}
                                                                        {sense.examples.map(
                                                                            (
                                                                                ex,
                                                                                exIndex,
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        exIndex
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        ex
                                                                                    }
                                                                                    {exIndex <
                                                                                        sense
                                                                                            .examples
                                                                                            .length -
                                                                                            1 && (
                                                                                        <br />
                                                                                    )}
                                                                                </span>
                                                                            ),
                                                                        )}
                                                                    </p>
                                                                )}
                                                        </li>
                                                    ),
                                                )}
                                        </ul>

                                        {((entry.synonyms &&
                                            entry.synonyms.length > 0) ||
                                            (entry.antonyms &&
                                                entry.antonyms.length > 0)) && (
                                            <table
                                                className="table table-bordered table-sm mt-2"
                                                style={{
                                                    borderRadius: "0.25rem",
                                                }}
                                            >
                                                <thead>
                                                    <tr className="text-center">
                                                        <th scope="col">
                                                            Synonyms
                                                        </th>
                                                        <th scope="col">
                                                            Antonyms
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="text-center">
                                                        <td>
                                                            {entry.synonyms &&
                                                                entry.synonyms.map(
                                                                    (
                                                                        synonym,
                                                                        synIndex,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                synIndex
                                                                            }
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    synonym
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </td>
                                                        <td>
                                                            {entry.antonyms &&
                                                                entry.antonyms.map(
                                                                    (
                                                                        antonym,
                                                                        antIndex,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                antIndex
                                                                            }
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    antonym
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="container text-center">
                        {data && "message" in data && data.message}
                    </div>
                )}
            </div>
        </div>
    );
};
