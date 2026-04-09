import React, { useState } from "react";
import { Collection } from "../../interfaces/model";
import { useLanguage } from "../../LanguageContext";
import "../../styles/AddWordModal.css";
import { ToastType } from "../Toast";
import { getWordsByCollectionId } from "../../services/WordService";

interface SelectionPracticeModalProps {
    collections: Collection[];
    onSelect: (collectionId: string) => void;
    id?: string;
    title?: string;
    onToast?: (message: string, type: ToastType) => void;
}

export const SelectionPracticeModal: React.FC<SelectionPracticeModalProps> = ({
    collections,
    onSelect,
    id = "collection-selection-practice-modal",
    title = "Practice Setup",
    onToast,
}) => {
    const { translations } = useLanguage();
    const [selectedId, setSelectedId] = useState<string>("");

    const handleStart = async () => {
        if (selectedId !== "") {
            // Find the selected collection
            const selectedCollection = collections.find(c => c.id === selectedId);

            if (!selectedCollection) {
                if (onToast) {
                    onToast(translations["alert.validateCollectionEmpty"] || "", "warning");
                }
                return;
            }

            // Fetch words from database
            const words = await getWordsByCollectionId(selectedId);

            // Check if collection is empty
            if (!words || words.length === 0) {
                if (onToast) {
                    onToast(translations["alert.warningCollectionEmpty"] || "", "warning");
                }
                return;
            }

            // Filter words that have definitions (required for quiz)
            const wordsWithDefinitions = words.filter(
                word => word.definitions && word.definitions.length > 0
            );

            // Check if there are enough words for a quiz (minimum 4)
            if (wordsWithDefinitions.length < 4) {
                if (onToast) {
                    onToast(translations["alert.warningNotEnoughWords"] || "", "warning");
                }
                return;
            }

            // All validations passed, proceed with selection
            onSelect(selectedId);
        } else {
            if (onToast) {
                onToast(translations["alert.validateCollectionEmpty"] || "", "warning");
            }
        }
    };

    return (
        <div
            className="modal fade"
            id={id}
            tabIndex={-1}
            aria-labelledby={id}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content word-modal-content">
                    <div
                        className="word-modal-header"
                        style={{ backgroundColor: "#DD5746" }}
                    >
                        <h5 className="word-modal-title">
                            {title}
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

                    <div className="word-modal-body text-center p-4">
                        <div className="mb-4">
                            <i className="fas fa-book-reader" style={{ fontSize: "4rem", color: "#DD5746" }}></i>
                        </div>

                        <div className="mb-3">
                            <select
                                className="form-select form-select-lg"
                                value={selectedId}
                                onChange={(e) => setSelectedId(e.target.value)}
                                style={{ borderRadius: '12px' }}
                            >
                                <option value="">{translations["practice.selectCollection"] || ""}</option>

                                {/* Owned collections */}
                                {collections.filter(c => c.myRole === 'owner').length > 0 && (
                                    <optgroup label={translations["collectionPage.tabs.myCollections"] || "My Collections"}>
                                        {collections
                                            .filter(c => c.myRole === 'owner')
                                            .map((collection) => (
                                                <option key={collection.id} value={collection.id}>
                                                    {collection.name}
                                                </option>
                                            ))}
                                    </optgroup>
                                )}

                                {/* Shared collections (viewer + editor) */}
                                {collections.filter(c => c.myRole !== 'owner').length > 0 && (
                                    <optgroup label={translations["collectionPage.tabs.sharedWithMe"] || "Shared with me"}>
                                        {collections
                                            .filter(c => c.myRole !== 'owner')
                                            .map((collection) => {
                                                const roleLabel = collection.myRole === 'editor'
                                                    ? translations["shareModal.role.editor"] || 'Editor'
                                                    : translations["shareModal.role.viewer"] || 'Viewer';
                                                return (
                                                    <option key={collection.id} value={collection.id}>
                                                        {collection.name} ({roleLabel})
                                                    </option>
                                                );
                                            })}
                                    </optgroup>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="word-modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                        >
                            {translations["cancelBtn"]}
                        </button>
                        <button
                            type="button"
                            className="action-button btn-add-word"
                            onClick={handleStart}
                            data-bs-dismiss={selectedId !== "" ? "modal" : ""}
                        >
                            <i className="fas fa-play me-2"></i>
                            {translations["practice.startPractice"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
