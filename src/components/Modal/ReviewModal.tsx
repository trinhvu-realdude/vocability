import React, { useEffect, useState } from "react";
import { IDBPDatabase } from "idb";
import { MyDB, Word } from "../../interfaces/model";
import {
    calculateNextReview,
    getWordsForReview,
    updateWordAfterReview,
} from "../../services/SpacedRepetitionService";
import "../../styles/ReviewModal.css";
import "../../styles/FlashCard.css";
import { useLanguage } from "../../LanguageContext";
import { FlashCard } from "../Card/FlashCard";
import { handleTextToSpeech } from "../../utils/helper";

interface ReviewModalProps {
    db: IDBPDatabase<MyDB> | null | undefined;
    collectionId: number | null;
    collectionName: string;
    collectionColor: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
    db,
    collectionId,
    collectionName,
    collectionColor,
    isOpen,
    onClose,
}) => {
    const [wordsToReview, setWordsToReview] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);

    const [sentence, setSentence] = useState("");

    const { translations } = useLanguage();


    // Load words for review when modal opens
    useEffect(() => {
        if (isOpen && db && collectionId) {
            loadWordsForReview();
        }
    }, [isOpen, db, collectionId]);

    const loadWordsForReview = async () => {
        if (!db || !collectionId) return;

        setIsLoading(true);
        const words = await getWordsForReview(db, collectionId);
        setWordsToReview(words);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        setReviewedCount(0);
        setSentence("");
        setIsLoading(false);
    };

    const handleFlip = () => {
        handleTextToSpeech(wordsToReview[currentIndex].word, translations["language"]);
        if (!isFlipped) {
            setIsFlipped(prev => !prev);
        }
    };

    const handleQualityRating = async (quality: number) => {
        if (!db || wordsToReview.length === 0) return;

        const currentWord = wordsToReview[currentIndex];
        const updatedWord = calculateNextReview(currentWord, quality);

        // Update word in database
        await updateWordAfterReview(db, updatedWord);

        // Start flip back animation first
        setIsFlipped(false);

        // Wait for card to be midway flipped (90deg) before changing content
        setTimeout(() => {
            setReviewedCount((prev) => prev + 1);
            setSentence(""); // Reset sentence

            // Move to next card or complete session
            if (currentIndex < wordsToReview.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setSessionComplete(true);
            }
        }, 200);
    };

    const handleClose = () => {
        setWordsToReview([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        setReviewedCount(0);
        setSentence("");
        onClose();

        // Notify other components to refresh review counts
        const event = new CustomEvent('reviewCountUpdated');
        window.dispatchEvent(event);
    };

    if (!isOpen) return null;

    const currentWord = wordsToReview[currentIndex];
    const progress = wordsToReview.length > 0
        ? ((currentIndex + (sessionComplete ? 1 : 0)) / wordsToReview.length) * 100
        : 0;

    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={handleClose}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content review-modal-content">
                    {/* Header */}
                    <div
                        className="review-modal-header"
                        style={{ backgroundColor: collectionColor }}
                    >
                        <h5 className="review-modal-title">
                            <i className="fas fa-brain"></i>
                            {translations["review"]}: {collectionName}
                        </h5>
                        <button
                            className="review-modal-close"
                            onClick={handleClose}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="review-modal-body">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border" style={{ color: collectionColor }}>
                                    <span className="visually-hidden">{translations["loading"]}...</span>
                                </div>
                                <p className="mt-3">{translations["review.loadingSession"]}</p>
                            </div>
                        ) : wordsToReview.length === 0 ? (
                            <div className="text-center py-5">
                                <i
                                    className="fas fa-check-circle"
                                    style={{ fontSize: "5rem", color: "#28a745" }}
                                ></i>
                                <h4 className="mt-4">{translations["review.noWords"]}</h4>
                                <p className="text-muted">
                                    {translations["review.upToDate"]}
                                    <br />
                                    {translations["review.comeBackLater"]}
                                </p>
                            </div>
                        ) : sessionComplete ? (
                            /* Session Summary */
                            <div className="review-summary">
                                <div className="review-summary-icon">
                                    <i className="fas fa-trophy"></i>
                                </div>
                                <h2 className="review-summary-title">
                                    {translations["review.complete"]}
                                </h2>
                                <p className="text-muted">
                                    {translations["review.greatJob"]}
                                </p>

                                <div className="review-summary-stats">
                                    <div className="review-summary-stat">
                                        <span className="review-summary-stat-value">
                                            {reviewedCount}
                                        </span>
                                        <span className="review-summary-stat-label">
                                            {translations["review.wordsReviewed"]}
                                        </span>
                                    </div>
                                    <div className="review-summary-stat">
                                        <span className="review-summary-stat-value">
                                            {collectionName}
                                        </span>
                                        <span className="review-summary-stat-label">
                                            {translations["review.collection"]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Review Session with 2-Column Layout */
                            <div className="container-fluid p-0">
                                {/* Progress Bar (Full Width) */}
                                <div className="review-progress mb-4">
                                    <div className="review-progress-text">
                                        <span>
                                            {translations["review.card"]} {currentIndex + 1} {translations["review.of"]} {wordsToReview.length}
                                        </span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="review-progress-bar-container">
                                        <div
                                            className="review-progress-bar"
                                            style={{
                                                width: `${progress}%`,
                                                background: `linear-gradient(90deg, ${collectionColor} 0%, ${collectionColor}dd 100%)`,
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="row g-4">
                                    {/* Left Column: FlashCard */}
                                    <div className="col-lg-6 d-flex align-items-center justify-content-center">
                                        <FlashCard
                                            word={currentWord}
                                            isFlipped={isFlipped}
                                            onFlip={handleFlip}
                                            cardColor={collectionColor}
                                        />
                                    </div>

                                    {/* Right Column: Sentence Input & Controls */}
                                    <div className="col-lg-6 d-flex flex-column justify-content-center">
                                        {/* Sentence Input */}
                                        <div className="mb-4">
                                            <label className="form-label fw-bold text-muted">
                                                <i className="fas fa-pen-alt me-2"></i>
                                                {translations["review.writeSentence"]}
                                            </label>
                                            <textarea
                                                className="form-control review-sentence-input"
                                                rows={4}
                                                placeholder={translations["review.writeSentencePlaceholder"]}
                                                value={sentence}
                                                onChange={(e) => setSentence(e.target.value)}
                                                style={{
                                                    borderColor: collectionColor,
                                                    resize: "none"
                                                }}
                                            ></textarea>
                                        </div>

                                        {/* Controls */}
                                        <div className="review-controls-section" style={{ minHeight: '120px' }}>
                                            {isFlipped && (
                                                <div className="review-quality-section mt-0 animation-fade-in">
                                                    <div className="review-quality-title">
                                                        {translations["review.title"]}
                                                    </div>
                                                    <div className="review-quality-buttons">
                                                        <button
                                                            className="review-quality-btn again"
                                                            onClick={(e) => { e.stopPropagation(); handleQualityRating(1); }}
                                                        >
                                                            <div>{translations["review.again"]}</div>
                                                        </button>
                                                        <button
                                                            className="review-quality-btn hard"
                                                            onClick={(e) => { e.stopPropagation(); handleQualityRating(2); }}
                                                        >
                                                            <div>{translations["review.hard"]}</div>
                                                        </button>
                                                        <button
                                                            className="review-quality-btn good"
                                                            onClick={(e) => { e.stopPropagation(); handleQualityRating(3); }}
                                                        >
                                                            <div>{translations["review.good"]}</div>
                                                        </button>
                                                        <button
                                                            className="review-quality-btn easy"
                                                            onClick={(e) => { e.stopPropagation(); handleQualityRating(4); }}
                                                        >
                                                            <div>{translations["review.easy"]}</div>
                                                        </button>
                                                        <button
                                                            className="review-quality-btn perfect"
                                                            onClick={(e) => { e.stopPropagation(); handleQualityRating(5); }}
                                                        >
                                                            <div>{translations["review.perfect"]}</div>
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="review-modal-footer">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleClose}
                        >
                            <i className="fas fa-times me-2"></i>
                            {translations["closeBtn"]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
