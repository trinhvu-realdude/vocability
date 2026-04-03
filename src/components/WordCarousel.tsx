import React, { useEffect, useState } from "react";
import { Word } from "../interfaces/model";
import { getWordsByCollectionId } from "../services/WordService";
import { FlashCard } from "./Card/FlashCard";
import "../styles/WordCarousel.css";

interface WordCarouselProps {
    collectionId: string;
    collectionColor?: string;
}

const CarouselFlashCard: React.FC<{ word: Word, color: string }> = ({ word, color }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="carousel-card-wrapper">
            <FlashCard
                word={word}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                cardColor={color}
            />
        </div>
    );
};

export const WordCarousel: React.FC<WordCarouselProps> = ({ collectionId, collectionColor }) => {
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                if (collectionId) {
                    const fetchedWords = await getWordsByCollectionId(collectionId);
                    setWords(fetchedWords);
                }
            } catch (error) {
                console.error("Failed to fetch words for carousel:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWords();
    }, [collectionId]);

    // Check if collection has more than 5 words
    if (loading || words.length <= 5) {
        return null;
    }

    // Ensure we have enough items so the carousel group is wider than any screen.
    let duplicatedWords = [...words];
    while (duplicatedWords.length > 0 && duplicatedWords.length < 15) {
        duplicatedWords = [...duplicatedWords, ...words];
    }

    const cardColor = collectionColor || "#059669"; // default emerald color if none provided

    return (
        <div className="word-carousel-container">
            <div className="word-carousel">
                <div className="carousel-track">
                    <div className="carousel-group">
                        {duplicatedWords.map((word, index) => (
                            <CarouselFlashCard key={`g1-${word.id}-${index}`} word={word} color={cardColor} />
                        ))}
                    </div>
                    <div className="carousel-group" aria-hidden="true">
                        {duplicatedWords.map((word, index) => (
                            <CarouselFlashCard key={`g2-${word.id}-${index}`} word={word} color={cardColor} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
