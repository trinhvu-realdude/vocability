import React from "react";
import ReactSelectCreatable from "react-select/creatable";

interface ImportSetFormProps {
    translations: any;
    choice: any;
    setChoice: (val: any) => void;
    collections: any[];
    errors: any;
    setErrors: (val: any) => void;
    setRandomColor: (val: string) => void;
    getRandomColor: () => string;
    importText: string;
    setImportText: (val: string) => void;
    handleParseImport: () => void;
    importList: any[];
    setImportList: (val: any[]) => void;
    handleImportListChange: (index: number, field: "word" | "definition", value: string) => void;
    handleRemoveImportItem: (index: number) => void;
    importMethod: 'paste' | 'excel';
    setImportMethod: (method: 'paste' | 'excel') => void;
    excelFile: File | null;
    setExcelFile: (file: File | null) => void;
    handleExcelImport: () => Promise<void>;
    isParsingExcel: boolean;
}

export const ImportSetForm: React.FC<ImportSetFormProps> = ({
    translations,
    choice,
    setChoice,
    collections,
    errors,
    setErrors,
    setRandomColor,
    getRandomColor,
    importText,
    setImportText,
    handleParseImport,
    importList,
    setImportList,
    handleImportListChange,
    handleRemoveImportItem,
    importMethod,
    setImportMethod,
    excelFile,
    setExcelFile,
    handleExcelImport,
    isParsingExcel,
}) => {
    return (
        <div className="import-container mb-4">
            <div className="input-group col-12 mb-3">
                <ReactSelectCreatable
                    className="react-select-creatable"
                    placeholder={translations["addWordForm.collection"]}
                    value={choice}
                    options={collections.map((collection) => ({
                        label: collection.name,
                        value: collection.name,
                        color: collection.color,
                    }))}
                    onChange={(choice: any) => {
                        setChoice(choice);
                        if (errors.collection) {
                            setErrors({ ...errors, collection: undefined });
                        }
                        if (choice?.color) {
                            setRandomColor(choice.color);
                        } else {
                            setRandomColor(getRandomColor());
                        }
                    }}
                    styles={{
                        menu: (provided: any) => ({
                            ...provided,
                            zIndex: 1050,
                        }),
                    }}
                />
                {errors.collection && (
                    <div className="text-danger small">{errors.collection}</div>
                )}
            </div>

            {/* Import Method Selection */}
            <div className="import-method-selection mb-3">
                <div className="row">
                    <div className="col-6">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="importMethod"
                                id="importMethodPaste"
                                checked={importMethod === "paste"}
                                onChange={() => setImportMethod("paste")}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="importMethodPaste"
                            >
                                {translations["importSetForm.copyPaste"]}
                            </label>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="importMethod"
                                id="importMethodExcel"
                                checked={importMethod === "excel"}
                                onChange={() => setImportMethod("excel")}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="importMethodExcel"
                            >
                                {translations["importSetForm.excelImport"]}
                            </label>
                        </div>
                    </div>
                </div>
            </div>


            {/* Copy & Paste Method */}
            {importMethod === 'paste' && (

                <div className="import-textarea-wrapper">
                    <textarea
                        className="form-control import-textarea"
                        rows={6}
                        placeholder={`Word 1    Definition 1\nWord 2  :  Definition 2\nWord 3  -  Definition 3\nWord 4\tDefinition 4`}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleParseImport();
                            }
                        }}
                    ></textarea>
                    <div className="d-flex gap-2 mt-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-clear-import"
                            onClick={() => setImportText("")}
                            disabled={!importText.trim()}
                        >
                            <i className="fas fa-eraser me-1"></i>
                            {translations["importSetForm.clearBtn"]}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-parse-import flex-grow-1"
                            onClick={handleParseImport}
                            disabled={!importText.trim()}
                        >
                            <i className="fas fa-magic me-1"></i>
                            {translations["importSetForm.parseWordsBtn"]}
                        </button>
                    </div>
                </div>
            )}

            {/* Excel Import Method */}
            {importMethod === 'excel' && (
                <div className="excel-import-wrapper">
                    <div className="mb-3">
                        <input
                            type="file"
                            className="form-control"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setExcelFile(file);
                            }}
                        />
                        {excelFile && (
                            <small className="text-success d-block mt-1">
                                <i className="fas fa-check-circle me-1"></i>
                                {translations["importSetForm.fileSelected"]}: {excelFile.name}
                            </small>
                        )}
                        {!excelFile && (
                            <small className="text-muted d-block mt-1">
                                {translations["importSetForm.noFileSelected"]}
                            </small>
                        )}
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-parse-import flex-grow-1 w-100"
                        onClick={handleExcelImport}
                        disabled={!excelFile || isParsingExcel}
                    >
                        {isParsingExcel ? (
                            <>
                                <i className="fas fa-spinner fa-spin me-1"></i>
                                {translations["importSetForm.parsingExcel"]}
                            </>
                        ) : (
                            <>
                                <i className="fas fa-upload me-1"></i>
                                {translations["importSetForm.uploadBtn"]}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Review Section (shown for both methods) */}
            {importList.length > 0 && (
                <div className="import-review-list mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="m-0 d-flex align-items-center">
                            <i className="fas fa-list-check me-2"></i>
                            {translations["importSetForm.reviewWords"]} ({importList.length})
                        </h6>
                        <button
                            type="button"
                            className="btn btn-sm btn-clear-all"
                            onClick={() => setImportList([])}
                        >
                            <i className="fas fa-trash-sweep me-1"></i>
                            {translations["importSetForm.clearAllBtn"]}
                        </button>
                    </div>
                    <div className="import-scroll-area">
                        {importList.map((item, index) => (
                            <div key={index} className="import-item-row mb-3">
                                <div className="row g-2 align-items-center">
                                    <div className="col-12 col-md-5">
                                        <div className="input-with-label">
                                            <small className="text-muted mb-1 d-block">{translations["importSetForm.word"]}</small>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={item.word}
                                                onChange={(e) => handleImportListChange(index, "word", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-10 col-md-6">
                                        <div className="input-with-label">
                                            <small className="text-muted mb-1 d-block">{translations["importSetForm.definition"]}</small>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={item.definition}
                                                onChange={(e) => handleImportListChange(index, "definition", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-2 col-md-1 text-end mt-md-4">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-remove-item"
                                            onClick={() => handleRemoveImportItem(index)}
                                            title="Remove row"
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};