import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "../../interfaces/model";
import {
    getCurrentLanguageId,
    getRandomColor,
    reorderActiveLanguages,
} from "../../utils/helper";
import { useState, useRef, useEffect } from "react";
import {
    addCollection,
    getActiveLanguages,
    getCollectionsByLanguageId,
} from "../../services/CollectionService";
import { languages } from "../../utils/constants";
import { useLanguage } from "../../LanguageContext";
import "../../styles/AddWordModal.css";

export const CreateCollectionModal: React.FC<{
    db: IDBPDatabase<MyDB> | undefined;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}> = ({ db, setCollections }) => {
    const [randomColor, setRandomColor] = useState<string>(getRandomColor());
    const [color, setColor] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const { translations, setActiveLanguages } = useLanguage();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    const handleAddCollection = async () => {
        try {
            if (db) {
                const currentLanguageId = await getCurrentLanguageId(
                    languages,
                    translations["language"]
                );
                const objCollection = {
                    name: name || "Default",
                    color: color || randomColor,
                    createdAt: new Date(),
                    languageId: currentLanguageId,
                } as Collection;
                await addCollection(db, objCollection);

                const storedCollections = await getCollectionsByLanguageId(
                    db,
                    currentLanguageId
                );
                const activeLanguages = await getActiveLanguages(db);
                const reorderedLanguages = reorderActiveLanguages(
                    activeLanguages,
                    translations["language"]
                );
                setActiveLanguages(reorderedLanguages);
                setCollections(storedCollections);
                reset();
            }
        } catch (error) {
            console.log(error);
            alert(translations["alert.addCollectionFailed"]);
        }
    };

    const reset = () => {
        setColor("");
        setName("");
        setRandomColor(getRandomColor());
        setShowEmojiPicker(false);
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setName((prevName) => prevName + emojiData.emoji);
    };

    return (
        <div
            className="modal fade"
            id="add-collection"
            tabIndex={-1}
            aria-labelledby="#add-collection"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content word-modal-content emoji-modal">
                    <div
                        className="word-modal-header"
                        style={{
                            backgroundColor: color !== "" ? color : randomColor,
                        }}
                    >
                        <h5 className="word-modal-title">
                            <i className="fas fa-folder-plus me-2"></i>
                            {translations["createForm.createCollection"]}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm word-modal-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAddCollection();
                        }}
                    >
                        <div className="word-modal-body" style={{ overflow: 'visible' }}>
                            <div className="text-center mb-3">
                                <i
                                    className="fas fa-folder"
                                    style={{
                                        color: color !== "" ? color : randomColor,
                                        fontSize: "4rem"
                                    }}
                                ></i>
                            </div>

                            <div className="input-group mb-3" style={{ position: 'relative' }}>
                                <span className="input-group-text">
                                    <i className="fas fa-palette"></i>
                                </span>
                                <input
                                    type="color"
                                    className="form-control form-control-color"
                                    id="color-input"
                                    value={color !== "" ? color : randomColor}
                                    title="Choose your color"
                                    onChange={(event) =>
                                        setColor(event.target.value)
                                    }
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={translations["name"]}
                                    value={name}
                                    style={{ borderRadius: '0' }}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className="btn emoji-picker-btn"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    <i className="far fa-smile"></i>
                                </button>
                                {showEmojiPicker && (
                                    <div
                                        ref={emojiPickerRef}
                                        className="emoji-picker-container"
                                    >
                                        <EmojiPicker
                                            onEmojiClick={onEmojiClick}
                                            theme={Theme.LIGHT}
                                            lazyLoadEmojis={true}
                                            height={350}
                                            width={400}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="word-modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                            >
                                <i className="fas fa-times me-1"></i>
                                {translations["cancelBtn"]}
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success"
                                data-bs-dismiss="modal"
                            >
                                <i className="fas fa-plus me-1"></i>
                                {translations["createBtn"]}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
