import { useState } from "react";
import { CommonProps } from "../interfaces/mainProps";
import { documentFileFormats, FILETYPE } from "../utils/constants";
import { getWordsByCollectionId } from "../services/WordService";
import { exportToDocx, exportToPdf } from "../utils/generateDocument";
import { DownloadDocumentModal } from "../components/Modal/DownloadDocumentModal";
import {
    getCollectionById,
    getColorByCollectionId,
} from "../services/CollectionService";
import { formatFileName } from "../utils/formatDateString";
import { PageHeader } from "../components/PageHeader";

export const ExportPage: React.FC<CommonProps> = ({ db, collections }) => {
    const [exportCollectionId, setExportCollectionId] = useState<number>();
    const [fileType, setFileType] = useState<string>("");
    const [filename, setFileName] = useState<string>("");
    const [collectionColor, setCollectionColor] = useState<string>("");
    const [documentUrl, setDocumentUrl] = useState<string>("");

    const handleGenerateDocument = async () => {
        if (db && exportCollectionId && fileType) {
            const words = await getWordsByCollectionId(db, exportCollectionId);
            const color = await getColorByCollectionId(db, exportCollectionId);
            setCollectionColor(color);
            const collection = await getCollectionById(db, exportCollectionId);

            if (collection) {
                setFileName(formatFileName(collection.name, fileType));
            }

            let url: string = "";
            switch (fileType) {
                case FILETYPE.PDF:
                    url = await exportToPdf(words);
                    break;

                case FILETYPE.DOCX:
                    url = await exportToDocx(words);
                    break;

                default:
                    break;
            }
            setDocumentUrl(url);
        } else {
            alert("Please choose the collection and file format");
        }
    };

    return (
        <div className="container-list" id="import-export">
            <PageHeader href={document.referrer} content="Export" />
            <div className="export-form">
                <div className="input-group mb-4">
                    <select
                        className="form-select"
                        id="part-of-speech"
                        onChange={(event) =>
                            setExportCollectionId(
                                Number.parseInt(event.target.value)
                            )
                        }
                    >
                        <option value="">Choose a collection</option>
                        {collections &&
                            collections.map((collection) => (
                                <option
                                    key={collection.id}
                                    value={collection.id}
                                >
                                    {collection.name}
                                </option>
                            ))}
                    </select>
                    <select
                        className="form-select"
                        id="file-formate"
                        onChange={(event) => setFileType(event.target.value)}
                    >
                        <option value="">File format</option>
                        {documentFileFormats.map((format, index) => (
                            <option key={index} value={format.type}>
                                {format.type}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <button
                        className="btn btn-outline-secondary"
                        style={{ width: "100%" }}
                        data-bs-toggle="modal"
                        data-bs-target={`#download-document`}
                        onClick={handleGenerateDocument}
                    >
                        Generate
                    </button>
                    {exportCollectionId && fileType && (
                        <DownloadDocumentModal
                            collectionColor={collectionColor}
                            blobUrl={documentUrl}
                            filename={filename}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
