import { IDBPDatabase } from "idb";
import { MyDB, Word } from "../interfaces/model";

/**
 * SM-2 (SuperMemo 2) Spaced Repetition Algorithm
 * Quality ratings: 0-5
 * 0 - Complete blackout
 * 1 - Incorrect response, correct one remembered
 * 2 - Incorrect response, correct one seemed easy to recall
 * 3 - Correct response, but required significant difficulty
 * 4 - Correct response, after some hesitation
 * 5 - Perfect response
 */

export interface ReviewStats {
    totalWords: number;
    wordsForReview: number;
    reviewedToday: number;
    averageEaseFactor: number;
}

/**
 * Calculate next review based on SM-2 algorithm
 * @param word - The word being reviewed
 * @param quality - Quality of recall (0-5)
 * @returns Updated word with new spaced repetition values
 */
export const calculateNextReview = (word: Word, quality: number): Word => {
    // Initialize default values if not present
    let easeFactor = word.easeFactor ?? 2.5;
    let interval = word.interval ?? 0;
    let repetitions = word.repetitions ?? 0;

    // Quality must be between 0 and 5
    quality = Math.max(0, Math.min(5, quality));

    // Calculate new ease factor
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // If quality < 3, restart the repetition
    if (quality < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        repetitions += 1;

        // Calculate new interval
        if (repetitions === 1) {
            interval = 1;
        } else if (repetitions === 2) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
        ...word,
        easeFactor,
        interval,
        repetitions,
        nextReviewDate,
    };
};

/**
 * Get words that are due for review from a collection
 * @param db - IndexedDB database
 * @param collectionId - ID of the collection
 * @returns Array of words due for review
 */
export const getWordsForReview = async (
    db: IDBPDatabase<MyDB>,
    collectionId: number
): Promise<Word[]> => {
    const tx = db.transaction("words", "readonly");
    const store = tx.objectStore("words");
    const allWords = await store.getAll();

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for fair comparison

    // Filter words from the collection that are due for review
    const wordsForReview = allWords.filter((word) => {
        if (word.collectionId !== collectionId) return false;

        // If never reviewed (no nextReviewDate), it's due for review
        if (!word.nextReviewDate) return true;

        // Check if review date has passed
        const reviewDate = new Date(word.nextReviewDate);
        reviewDate.setHours(0, 0, 0, 0);

        return reviewDate <= now;
    });

    // Shuffle the words for variety
    return shuffleArray(wordsForReview);
};

/**
 * Update word after review
 * @param db - IndexedDB database
 * @param word - Word with updated review data
 */
export const updateWordAfterReview = async (
    db: IDBPDatabase<MyDB>,
    word: Word
): Promise<void> => {
    const tx = db.transaction("words", "readwrite");
    const store = tx.objectStore("words");
    await store.put(word);
    await tx.done;
};

/**
 * Get review statistics for a collection
 * @param db - IndexedDB database
 * @param collectionId - ID of the collection
 * @returns Review statistics
 */
export const getReviewStats = async (
    db: IDBPDatabase<MyDB>,
    collectionId: number
): Promise<ReviewStats> => {
    const tx = db.transaction("words", "readonly");
    const store = tx.objectStore("words");
    const allWords = await store.getAll();

    const collectionWords = allWords.filter(
        (word) => word.collectionId === collectionId
    );

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const wordsForReview = collectionWords.filter((word) => {
        if (!word.nextReviewDate) return true;
        const reviewDate = new Date(word.nextReviewDate);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate <= now;
    });

    const reviewedToday = collectionWords.filter((word) => {
        if (!word.nextReviewDate) return false;
        const reviewDate = new Date(word.nextReviewDate);
        const today = new Date();
        return (
            reviewDate.getDate() === today.getDate() &&
            reviewDate.getMonth() === today.getMonth() &&
            reviewDate.getFullYear() === today.getFullYear()
        );
    });

    const totalEaseFactor = collectionWords.reduce(
        (sum, word) => sum + (word.easeFactor ?? 2.5),
        0
    );
    const averageEaseFactor =
        collectionWords.length > 0
            ? totalEaseFactor / collectionWords.length
            : 2.5;

    return {
        totalWords: collectionWords.length,
        wordsForReview: wordsForReview.length,
        reviewedToday: reviewedToday.length,
        averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
    };
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
