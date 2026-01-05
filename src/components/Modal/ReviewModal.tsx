import React, { useEffect, useState } from "react";
import { IDBPDatabase } from "idb";
import { MyDB, Word } from "../../interfaces/model";
import {
    calculateNextReview,
    getWordsForReview,
    updateWordAfterReview,
} from "../../services/SpacedRepetitionService";
import "../../styles/ReviewModal.css";

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
        setIsLoading(false);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleQualityRating = async (quality: number) => {
        if (!db || wordsToReview.length === 0) return;

        const currentWord = wordsToReview[currentIndex];
        const updatedWord = calculateNextReview(currentWord, quality);

        // Update word in database
        await updateWordAfterReview(db, updatedWord);

        setReviewedCount((prev) => prev + 1);

        // Move to next card or complete session
        if (currentIndex < wordsToReview.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
        } else {
            setSessionComplete(true);
        }
    };

    const handleClose = () => {
        setWordsToReview([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionComplete(false);
        setReviewedCount(0);
        onClose();
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
                className="modal-dialog modal-dialog-centered modal-lg"
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
                            Review: {collectionName}
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
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading review session...</p>
                            </div>
                        ) : wordsToReview.length === 0 ? (
                            <div className="text-center py-5">
                                <i
                                    className="fas fa-check-circle"
                                    style={{ fontSize: "5rem", color: "#28a745" }}
                                ></i>
                                <h4 className="mt-4">No words to review!</h4>
                                <p className="text-muted">
                                    All words in this collection are up to date.
                                    <br />
                                    Come back later for your next review session.
                                </p>
                            </div>
                        ) : sessionComplete ? (
                            /* Session Summary */
                            <div className="review-summary">
                                <div className="review-summary-icon">
                                    <i className="fas fa-trophy"></i>
                                </div>
                                <h2 className="review-summary-title">
                                    Review Complete!
                                </h2>
                                <p className="text-muted">
                                    Great job! You've reviewed all due words.
                                </p>

                                <div className="review-summary-stats">
                                    <div className="review-summary-stat">
                                        <span className="review-summary-stat-value">
                                            {reviewedCount}
                                        </span>
                                        <span className="review-summary-stat-label">
                                            Words Reviewed
                                        </span>
                                    </div>
                                    <div className="review-summary-stat">
                                        <span className="review-summary-stat-value">
                                            {collectionName}
                                        </span>
                                        <span className="review-summary-stat-label">
                                            Collection
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Review Card */
                            <div className="review-card-container">
                                {/* Progress */}
                                <div className="review-progress">
                                    <div className="review-progress-text">
                                        <span>
                                            Card {currentIndex + 1} of {wordsToReview.length}
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

                                {/* FlashCard */}
                                <div
                                    className={`review-flashcard ${isFlipped ? "flipped" : ""}`}
                                >
                                    <div className="review-flashcard-inner">
                                        {/* Front - Word */}
                                        <div
                                            className="review-flashcard-front"
                                            style={{ borderColor: collectionColor }}
                                        >
                                            <div
                                                className="card-header"
                                                style={{ backgroundColor: collectionColor }}
                                            >
                                                <i className="fas fa-spell-check me-2"></i>
                                                Word
                                            </div>
                                            <div className="card-body">
                                                <div className="review-word">
                                                    {currentWord.phonetic && (
                                                        <>
                                                            <small>{currentWord.phonetic}</small>
                                                            <br />
                                                        </>
                                                    )}
                                                    {currentWord.word}
                                                    <br />
                                                    <small>
                                                        <i>({currentWord.partOfSpeech})</i>
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Back - Definition */}
                                        <div
                                            className="review-flashcard-back"
                                            style={{ borderColor: collectionColor }}
                                        >
                                            <div
                                                className="card-header"
                                                style={{ backgroundColor: collectionColor }}
                                            >
                                                <i className="fas fa-book-open me-2"></i>
                                                Definition
                                            </div>
                                            <div className="card-body">
                                                <div className="review-definition">
                                                    {currentWord.definitions[0].definition}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Flip Button or Quality Ratings */}
                                {!isFlipped ? (
                                    <div className="text-center">
                                        <button
                                            className="btn btn-primary review-flip-btn"
                                            onClick={handleFlip}
                                            style={{
                                                backgroundColor: collectionColor,
                                                borderColor: collectionColor,
                                                color: '#fff'
                                            }}
                                        >
                                            <i className="fas fa-sync-alt me-2"></i>
                                            Show Answer
                                        </button>
                                    </div>
                                ) : (
                                    <div className="review-quality-section">
                                        <div className="review-quality-title">
                                            How well did you know this word?
                                        </div>
                                        <div className="review-quality-buttons">
                                            <button
                                                className="review-quality-btn again"
                                                onClick={() => handleQualityRating(1)}
                                            >
                                                <div>😞 Again</div>
                                                {/* <small>Didn't know</small> */}
                                            </button>
                                            <button
                                                className="review-quality-btn hard"
                                                onClick={() => handleQualityRating(2)}
                                            >
                                                <div>😐 Hard</div>
                                                {/* <small>Struggled</small> */}
                                            </button>
                                            <button
                                                className="review-quality-btn good"
                                                onClick={() => handleQualityRating(3)}
                                            >
                                                <div>🙂 Good</div>
                                                {/* <small>Some effort</small> */}
                                            </button>
                                            <button
                                                className="review-quality-btn easy"
                                                onClick={() => handleQualityRating(4)}
                                            >
                                                <div>😊 Easy</div>
                                                {/* <small>Quick recall</small> */}
                                            </button>
                                            <button
                                                className="review-quality-btn perfect"
                                                onClick={() => handleQualityRating(5)}
                                            >
                                                <div>😄 Perfect</div>
                                                {/* <small>Instant</small> */}
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
