import { CommonProps } from "../interfaces/props";
import { documentFileFormats } from "../utils/constants";

export const ImportExportPage: React.FC<CommonProps> = ({ collections }) => {
    return (
        <div className="container-list" id="import-export">
            <h4 className="text-center mt-4">Export</h4>

            <div className="export-form">
                <div className="input-group mb-2">
                    <select className="form-select" id="part-of-speech">
                        <option value="">Choose a collection</option>
                        {collections &&
                            collections.map((collection) => (
                                <option
                                    key={collection.id}
                                    value={collection.name}
                                >
                                    {collection.name}
                                </option>
                            ))}
                    </select>
                </div>
                <div className="input-group mb-2">
                    <div className="d-flex">
                        {documentFileFormats.map((format, index) => (
                            <div
                                key={index}
                                className="form-check me-3 d-flex align-items-center"
                            >
                                <input
                                    className="form-check-input mt-0 me-2"
                                    type="checkbox"
                                    value={format.type}
                                    id={`checkbox-${index}`}
                                    aria-label={`Checkbox for ${format.type}`}
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor={`checkbox-${index}`}
                                >
                                    {format.type}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="input-group">
                    <button
                        className="btn btn-outline-secondary"
                        // onClick={handleAddWord}
                        style={{ width: "100%" }}
                    >
                        Generate
                    </button>
                </div>
            </div>

            <h4 className="text-center mt-4">Import</h4>
        </div>
    );
};
