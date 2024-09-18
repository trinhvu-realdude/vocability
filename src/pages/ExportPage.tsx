import { useState } from "react";
import { CommonProps } from "../interfaces/mainProps";
import { APP_NAME, documentFileFormats, FILETYPE } from "../utils/constants";
import { getWordsByCollectionId } from "../services/WordService";
import { exportToDocx, exportToPdf } from "../utils/generateDocument";
import { DownloadDocumentModal } from "../components/Modal/DownloadDocumentModal";
import {
    getCollectionById,
    getColorByCollectionId,
} from "../services/CollectionService";
import { formatFileName } from "../utils/formatDateString";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../LanguageContext";

export const ExportPage: React.FC<CommonProps> = ({ db, collections }) => {
    document.title = `${APP_NAME} | Export`;

    const [exportCollectionId, setExportCollectionId] = useState<number>();
    const [fileType, setFileType] = useState<string>("");
    const [filename, setFileName] = useState<string>("");
    const [collectionColor, setCollectionColor] = useState<string>("");
    const [documentUrl, setDocumentUrl] = useState<string>("");
    const [fromDate, setFromDate] = useState<Date>();
    const [toDate, setToDate] = useState<Date>();

    const { translations } = useLanguage();

    const handleGenerateDocument = async () => {
        if (db && exportCollectionId && fileType) {
            let words = await getWordsByCollectionId(db, exportCollectionId);
            if (fromDate && toDate) {
                words = words.filter(
                    (word) =>
                        word.createdAt >= fromDate && word.createdAt <= toDate
                );
            }

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
            alert(translations["alert.validateExportForm"]);
        }
    };

    return (
        <div className="container-list" id="import-export">
            <PageHeader content={translations["export"]} />
            <div className="export-form">
                <div className="input-group mb-2">
                    <select
                        className="form-select"
                        id="part-of-speech"
                        onChange={(event) =>
                            setExportCollectionId(
                                Number.parseInt(event.target.value)
                            )
                        }
                    >
                        <option value="">
                            {translations["export.chooseCollection"]}
                        </option>
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
                        <option value="">
                            {translations["export.fileFormat"]}
                        </option>
                        {documentFileFormats.map((format, index) => (
                            <option key={index} value={format.type}>
                                {format.type}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <button
                        className="btn"
                        style={{
                            border: "1px solid #ced4da",
                        }}
                    >
                        <strong>{translations["export.fromDate"]}:</strong>{" "}
                        <input
                            type="date"
                            style={{ border: "none" }}
                            onChange={(event) =>
                                setFromDate(
                                    new Date(`${event.target.value}T00:00:00`)
                                )
                            }
                        />
                    </button>
                    <button
                        className="btn"
                        style={{
                            border: "1px solid #ced4da",
                        }}
                    >
                        <strong>{translations["export.toDate"]}:</strong>{" "}
                        <input
                            type="date"
                            style={{ border: "none" }}
                            onChange={(event) =>
                                setToDate(
                                    new Date(
                                        `${event.target.value}T23:59:59.999`
                                    )
                                )
                            }
                        />
                    </button>
                </div>

                <div className="input-group">
                    <button
                        className="btn btn-outline-secondary"
                        style={{ width: "100%" }}
                        data-bs-toggle="modal"
                        data-bs-target={`#download-document`}
                        onClick={handleGenerateDocument}
                    >
                        {translations["export.generateBtn"]}
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
