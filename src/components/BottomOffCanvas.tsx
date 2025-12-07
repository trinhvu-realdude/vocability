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
    const [data, setData] = useState<ExternalWord[] | { message: string }>();
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
                height: `${data instanceof Array ? "100%" : "20%"}`,
                visibility: show ? "visible" : "hidden",
                transition: "visibility 0.3s ease, height 0.3s ease",
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
                ) : data && data instanceof Array ? (
                    data.map((element, index) => (
                        <div
                            className="d-flex w-100 justify-content-between mb-2"
                            key={index}
                        >
                            <div className="row">
                                <h5 className="mb-1">
                                    <strong>{element.word}</strong>{" "}
                                    <small
                                        className="text-muted mb-1"
                                        style={{ fontSize: "14px" }}
                                    >
                                        {element.phonetic}
                                    </small>{" "}
                                    <TextToSpeechButton word={element.word} />
                                </h5>
                                {element.meanings &&
                                    element.meanings.map((meaning, index) => (
                                        <div key={index}>
                                            <small>
                                                <i>{meaning.partOfSpeech}</i>
                                            </small>
                                            <div className="mx-2">
                                                <ul className="list-group list-group-flush">
                                                    {meaning.definitions &&
                                                        meaning.definitions.map(
                                                            (
                                                                definition,
                                                                index
                                                            ) => (
                                                                <li
                                                                    className="list-group-item"
                                                                    key={index}
                                                                >
                                                                    <p>
                                                                        {
                                                                            definition.definition
                                                                        }
                                                                    </p>
                                                                    {definition.example && (
                                                                        <p>
                                                                            <strong>
                                                                                Example:
                                                                            </strong>{" "}
                                                                            {
                                                                                definition.example
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </li>
                                                            )
                                                        )}
                                                </ul>
                                                {meaning.synonyms.length > 0 &&
                                                    meaning.antonyms.length >
                                                        0 && (
                                                        <table
                                                            className="table table-bordered table-sm mt-2"
                                                            style={{
                                                                borderRadius:
                                                                    "0.25rem",
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
                                                                        {meaning
                                                                            .synonyms
                                                                            .length >
                                                                            0 &&
                                                                            meaning.synonyms.map(
                                                                                (
                                                                                    synonym,
                                                                                    index
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        <span>
                                                                                            {
                                                                                                synonym
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                    </td>
                                                                    <td>
                                                                        {meaning
                                                                            .antonyms
                                                                            .length >
                                                                            0 &&
                                                                            meaning.antonyms.map(
                                                                                (
                                                                                    antonym,
                                                                                    index
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                    >
                                                                                        <span>
                                                                                            {
                                                                                                antonym
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                )
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
                    ))
                ) : (
                    <div className="container text-center">
                        {data && data.message}
                    </div>
                )}
            </div>
        </div>
    );
};
