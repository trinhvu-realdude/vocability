import { useState } from "react";
import { CollectionFormProps } from "../../interfaces/mainProps";
import {
    getCollectionById,
    getCollectionsByLanguageId,
    updateCollection,
} from "../../services/CollectionService";
import { languages } from "../../utils/constants";
import { useLanguage } from "../../LanguageContext";
import { getCurrentLanguageId } from "../../utils/helper";

export const EditCollectionForm: React.FC<CollectionFormProps> = ({
    db,
    collection,
    setIsEditOrDelete,
    setCollection,
    setCollections,
}) => {
    const [renameValue, setRenameValue] = useState<string>("");
    const [color, setColor] = useState<string>("");

    const { translations } = useLanguage();

    const handleEditCollection = async () => {
        try {
            if (db) {
                const updatedCollection = await updateCollection(
                    db,
                    collection,
                    renameValue !== "" ? renameValue.trim() : collection.name,
                    color !== "" ? color : collection.color
                );
                if (updatedCollection) {
                    const currentLanguageId = await getCurrentLanguageId(
                        languages,
                        translations["language"]
                    );
                    const storedCollections = await getCollectionsByLanguageId(
                        db,
                        currentLanguageId
                    );
                    setCollections(storedCollections);

                    if (collection.id && setCollection) {
                        const objCollection = await getCollectionById(
                            db,
                            collection.id
                        );
                        setCollection(objCollection);
                    }
                }
                setIsEditOrDelete(false);
            }
        } catch (error) {
            console.log(error);
            alert(translations["alert.renameCollectionFailed"]);
        }
    };

    return (
        <div className="folder-edit-form">
            {/* Folder Tab Header */}
            <div
                className="folder-form-tab"
                style={{
                    backgroundColor: color !== "" ? color : collection.color,
                }}
            >
                <div className="folder-form-tab-content">
                    <i className="fas fa-folder-open me-2"></i>
                    <span>{translations["editForm.editCollection"]}</span>
                </div>
                <button
                    className="folder-form-close-btn"
                    onClick={() => setIsEditOrDelete(false)}
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Folder Body */}
            <div
                className="folder-form-body"
                style={{
                    borderColor: color !== "" ? color : collection.color,
                }}
            >
                {/* Folder Icon Preview */}
                <div className="folder-form-preview">
                    <i
                        className="fas fa-folder"
                        style={{ color: color !== "" ? color : collection.color }}
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
                            value={color !== "" ? color : collection.color}
                            title="Choose your color"
                            onChange={(event) => setColor(event.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control"
                            defaultValue={collection.name}
                            placeholder={translations["name"]}
                            onChange={(event) => setRenameValue(event.target.value)}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="folder-form-actions">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setIsEditOrDelete(false)}
                    >
                        <i className="fas fa-times me-1"></i>
                        {translations["cancelBtn"]}
                    </button>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleEditCollection}
                    >
                        <i className="fas fa-save me-1"></i>
                        {translations["editBtn"]}
                    </button>
                </div>
            </div>
        </div>
    );
};
