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
import "../styles/AddWordModal.css";

export const ExportPage: React.FC<CommonProps> = ({ db, collections }) => {
    const { translations } = useLanguage();
    document.title = `${translations["flag"]} ${APP_NAME} | Export`;

    const [exportCollectionId, setExportCollectionId] = useState<number>();
    const [fileType, setFileType] = useState<string>("");
    const [filename, setFileName] = useState<string>("");
    const [collectionColor, setCollectionColor] = useState<string>("");
    const [documentUrl, setDocumentUrl] = useState<string>("");
    const [fromDate, setFromDate] = useState<Date>();
    const [toDate, setToDate] = useState<Date>();

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
            <div className="export-form word-modal-body p-4 bg-white rounded shadow-sm">
                <div className="mb-3">
                    <label htmlFor="export-collection" className="form-label text-muted small fw-bold">
                        {translations["export.chooseCollection"]}
                    </label>
                    <select
                        className="form-select"
                        id="export-collection"
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
                </div>

                <div className="mb-3">
                    <label htmlFor="file-format" className="form-label text-muted small fw-bold">
                        {translations["export.fileFormat"]}
                    </label>
                    <select
                        className="form-select"
                        id="file-format"
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

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">
                            {translations["export.fromDate"]}
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <i className="fas fa-calendar-alt text-muted"></i>
                            </span>
                            <input
                                type="date"
                                className="form-control"
                                onChange={(event) =>
                                    setFromDate(
                                        new Date(`${event.target.value}T00:00:00`)
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold">
                            {translations["export.toDate"]}
                        </label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                                <i className="fas fa-calendar-check text-muted"></i>
                            </span>
                            <input
                                type="date"
                                className="form-control"
                                onChange={(event) =>
                                    setToDate(
                                        new Date(
                                            `${event.target.value}T23:59:59.999`
                                        )
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="d-grid gap-2">
                    <button
                        className="btn btn-success text-white py-2 fw-bold"
                        style={{
                            background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
                            border: "none",
                            borderRadius: "10px",
                            boxShadow: "0 4px 6px rgba(40, 167, 69, 0.2)"
                        }}
                        data-bs-toggle="modal"
                        data-bs-target={`#download-document`}
                        onClick={handleGenerateDocument}
                        disabled={!exportCollectionId || !fileType}
                    >
                        <i className="fas fa-file-export me-2"></i>
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
