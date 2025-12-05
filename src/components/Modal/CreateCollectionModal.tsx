import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "../../interfaces/model";
import {
    getCurrentLanguageId,
    getRandomColor,
    reorderActiveLanguages,
} from "../../utils/helper";
import { useState } from "react";
import {
    addCollection,
    getActiveLanguages,
    getCollectionsByLanguageId,
} from "../../services/CollectionService";
import { languages } from "../../utils/constants";
import { useLanguage } from "../../LanguageContext";

export const CreateCollectionModal: React.FC<{
    db: IDBPDatabase<MyDB> | undefined;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}> = ({ db, setCollections }) => {
    const [randomColor, setRandomColor] = useState<string>(getRandomColor());
    const [color, setColor] = useState<string>("");
    const [name, setName] = useState<string>("");

    const { translations, setActiveLanguages } = useLanguage();

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
                <div className="modal-content folder-modal-content">
                    {/* Folder Tab Header */}
                    <div
                        className="folder-modal-tab"
                        style={{
                            backgroundColor: color !== "" ? color : randomColor,
                        }}
                    >
                        <h5 className="folder-modal-title">
                            <i className="fas fa-folder-plus me-2"></i>
                            {translations["createForm.createCollection"]}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm folder-modal-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Folder Modal Body */}
                    <div className="folder-modal-body">
                        {/* Folder Icon Preview */}
                        <div className="folder-preview-large">
                            <i
                                className="fas fa-folder"
                                style={{ color: color !== "" ? color : randomColor }}
                            ></i>
                        </div>

                        {/* Form Inputs */}
                        <div className="folder-form-inputs">
                            <div className="input-group mb-3">
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
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Folder Modal Footer */}
                    <div className="folder-modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            <i className="fas fa-times me-1"></i>
                            {translations["cancelBtn"]}
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleAddCollection}
                            data-bs-dismiss="modal"
                        >
                            <i className="fas fa-plus me-1"></i>
                            {translations["createBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
