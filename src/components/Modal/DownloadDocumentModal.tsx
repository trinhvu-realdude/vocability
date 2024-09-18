import { DownloadDocumentModalProps } from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";

export const DownloadDocumentModal: React.FC<DownloadDocumentModalProps> = ({
    collectionColor,
    filename,
    blobUrl,
}) => {
    const { translations } = useLanguage();

    return (
        <div
            className="modal fade"
            id={`download-document`}
            tabIndex={-1}
            aria-labelledby={`#download-document`}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div
                        className="modal-header"
                        style={{
                            backgroundColor: collectionColor,
                            color: "#fff",
                        }}
                    >
                        <h5 className="modal-title" id={`download-document`}>
                            {translations["downloadDocument"]}
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            style={{ border: "none", color: "#fff" }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="modal-body text-center">
                        <i className="fas fa-download"></i>{" "}
                        <a
                            href={blobUrl}
                            download={filename}
                            style={{ textDecoration: "underline" }}
                        >
                            {translations["downloadBtn"]} {filename}
                        </a>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            {translations["cancelBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
