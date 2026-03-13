import { supabase } from "../configs/supabase";
import { Word } from "../interfaces/model";

// ─── SM-2 Algorithm ─────────────────────────────────────────────────────────

export interface ReviewStats {
    totalWords: number;
    wordsForReview: number;
    reviewedToday: number;
    averageEaseFactor: number;
}

export const calculateNextReview = (word: Word, quality: number): Word => {
    let easeFactor = word.ease_factor ?? 2.5;
    let interval = word.interval ?? 0;
    let repetitions = word.repetitions ?? 0;

    quality = Math.max(0, Math.min(5, quality));
    easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    if (quality < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        repetitions += 1;
        if (repetitions === 1) interval = 1;
        else if (repetitions === 2) interval = 6;
        else interval = Math.round(interval * easeFactor);
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
        ...word,
        ease_factor: easeFactor,
        interval,
        repetitions,
        next_review_date: nextReviewDate.toISOString(),
    };
};

// ─── Supabase Queries ────────────────────────────────────────────────────────

export const getWordsForReview = async (
    collectionId: string
): Promise<Word[]> => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Words with no next_review_date OR next_review_date <= today
    const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("collection_id", collectionId);

    if (error) throw error;

    const due = (data ?? []).filter((word: any) => {
        if (!word.next_review_date) return true;
        const reviewDate = new Date(word.next_review_date);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate <= now;
    });

    // Shuffle using Fisher-Yates
    for (let i = due.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [due[i], due[j]] = [due[j], due[i]];
    }

    return due;
};

export const updateWordAfterReview = async (word: Word): Promise<void> => {
    const { error } = await supabase
        .from("words")
        .update({
            ease_factor: word.ease_factor,
            interval: word.interval,
            repetitions: word.repetitions,
            next_review_date: word.next_review_date,
        })
        .eq("id", word.id!);
    if (error) throw error;
};

export const getReviewStats = async (
    collectionId: string
): Promise<ReviewStats> => {
    const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("collection_id", collectionId);

    if (error) throw error;

    const words: Word[] = data ?? [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const today = new Date();

    const wordsForReview = words.filter((w) => {
        if (!w.next_review_date) return true;
        const d = new Date(w.next_review_date);
        d.setHours(0, 0, 0, 0);
        return d <= now;
    });

    const reviewedToday = words.filter((w) => {
        if (!w.next_review_date) return false;
        const d = new Date(w.next_review_date);
        return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
        );
    });

    const totalEaseFactor = words.reduce(
        (sum, w) => sum + (w.ease_factor ?? 2.5),
        0
    );

    return {
        totalWords: words.length,
        wordsForReview: wordsForReview.length,
        reviewedToday: reviewedToday.length,
        averageEaseFactor:
            words.length > 0
                ? Math.round((totalEaseFactor / words.length) * 100) / 100
                : 2.5,
    };
};
