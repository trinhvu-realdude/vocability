import React, { useState } from "react";
import { Collection } from "../../interfaces/model";
import { useLanguage } from "../../LanguageContext";
import "../../styles/AddWordModal.css";
import { ToastType } from "../Toast";
import { IDBPDatabase } from "idb";
import { MyDB } from "../../interfaces/model";
import { getWordsByCollectionId } from "../../services/WordService";

interface SelectionPracticeModalProps {
    collections: Collection[];
    onSelect: (collectionId: number) => void;
    id?: string;
    title?: string;
    practiceHref?: string;
    onToast?: (message: string, type: ToastType) => void;
    db?: IDBPDatabase<MyDB>;
}

// import crosswordVideo from "../../assets/videos/crossword.mp4";
// import scrambleVideo from "../../assets/videos/scramble.mp4";
// import quizVideo from "../../assets/videos/quiz.mp4";
// import matchingVideo from "../../assets/videos/matching.mp4";
// import memoryVideo from "../../assets/videos/memory.mp4";

const practiceVideos: Record<string, string> = {
    // "/practices/crossword-puzzles": crosswordVideo,
    // "/practices/word-scramble": scrambleVideo,
    // "/practices/vocabulary-quiz": quizVideo,
    // "/practices/word-matching": matchingVideo,
    // "/practices/memory-card": memoryVideo,
};

export const SelectionPracticeModal: React.FC<SelectionPracticeModalProps> = ({
    collections,
    onSelect,
    id = "collection-selection-practice-modal",
    title = "Practice Setup",
    practiceHref,
    onToast,
    db
}) => {
    const { translations } = useLanguage();
    const [selectedId, setSelectedId] = useState<number>(0);

    const videoSrc = practiceHref ? practiceVideos[practiceHref] : undefined;
    console.log(videoSrc);

    const handleStart = async () => {
        if (selectedId !== 0) {
            // Find the selected collection
            const selectedCollection = collections.find(c => c.id === selectedId);

            if (!selectedCollection || !db) {
                if (onToast) {
                    onToast(translations["alert.validateCollectionEmpty"] || "", "warning");
                }
                return;
            }

            // Fetch words from database
            const words = await getWordsByCollectionId(db, selectedId);

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
                        {/* {videoSrc ? (
                            <div className="ratio ratio-16x9">
                                <video controls autoPlay className="rounded-3">
                                    <source src={videoSrc} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ) : (
                            <> */}
                        <div className="mb-4">
                            <i className="fas fa-book-reader" style={{ fontSize: "4rem", color: "#DD5746" }}></i>
                        </div>

                        <div className="mb-3">
                            <select
                                className="form-select form-select-lg"
                                value={selectedId}
                                onChange={(e) => setSelectedId(Number(e.target.value))}
                                style={{ borderRadius: '12px' }}
                            >
                                <option value="">{translations["practice.selectCollection"] || ""}</option>
                                {collections?.map((collection) => (
                                    <option key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* </>
                        )} */}
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
                            data-bs-dismiss={selectedId !== 0 ? "modal" : ""}
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
