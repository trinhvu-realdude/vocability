import { Collection, Word } from "../interfaces/model";
import { useLanguage } from "../LanguageContext";
import { handleTextToSpeech } from "../utils/helper";

export const LeftOffCanvas: React.FC<{
    collection: Collection | undefined;
    words: Word[];
}> = ({ collection, words }) => {
    const { translations, setSelectedWord } = useLanguage();

    return (
        <div
            className="offcanvas offcanvas-start"
            tabIndex={-1}
            id="offcanvasWithBackdrop"
            aria-labelledby="offcanvasWithBackdropLabel"
        >
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasWithBackdropLabel">
                    <span style={{ color: collection?.color }}>
                        <strong>{collection?.name}</strong>
                    </span>
                </h5>
                <div
                    className="btn btn-sm"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                >
                    <i className="fas fa-times"></i>
                </div>
            </div>
            <div className="offcanvas-body">
                <ul className="list-group">
                    <p>List of words</p>
                    {words.length > 0 &&
                        words.map((word, index) => (
                            <li
                                className="list-group-item d-flex justify-content-between"
                                key={index}
                            >
                                <a
                                    className="word-link"
                                    href={`#${word.id}`}
                                    data-bs-dismiss="offcanvas"
                                    aria-label="Close"
                                    key={index}
                                    onClick={() => setSelectedWord(word)}
                                >
                                    {index + 1}. {word.word}
                                </a>
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
                                            undefined
                                        );
                                    }}
                                >
                                    <i className="fas fa-volume-up"></i>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};
