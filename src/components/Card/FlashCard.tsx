import React from "react";
import { Word } from "../../interfaces/model";
import { useLanguage } from "../../LanguageContext";

interface FlashCardProps {
    word: Word;
    isFlipped: boolean;
    onFlip: () => void;
    cardColor: string;
    frontType?: 'word' | 'definition';
}

export const FlashCard: React.FC<FlashCardProps> = ({
    word,
    isFlipped,
    onFlip,
    cardColor,
    frontType = 'word'
}) => {
    const { translations } = useLanguage();

    const renderWordSide = () => (
        <>
            <div className="card-header" style={{ backgroundColor: cardColor }}>
                <i className="fas fa-spell-check me-2"></i>
                {translations["review.word"]}
            </div>
            <div className="card-body">
                <div className="flashcard-word text-center">
                    {word.phonetic && (
                        <small>{word.phonetic}</small>
                    )}
                    <div>{word.word}</div>
                    {word.partOfSpeech && (
                        <small><i>({word.partOfSpeech})</i></small>
                    )}
                </div>
                {!isFlipped && (
                    <div className="click-hint">
                        <i className="fas fa-hand-pointer me-2"></i>
                        {translations["review.flipCard"]}
                    </div>
                )}
            </div>
        </>
    );

    const renderDefinitionSide = () => (
        <>
            <div className="card-header" style={{ backgroundColor: cardColor }}>
                <i className="fas fa-book-open me-2"></i>
                {translations["review.definition"]}
            </div>
            <div className="card-body">
                <div className="flashcard-definition">
                    {word.definitions && word.definitions.length > 0
                        ? word.definitions[0].definition
                        : "No definition available"}
                </div>
            </div>
        </>
    );

    return (
        <div
            className={`flashcard-container ${isFlipped ? "flipped" : ""}`}
            onClick={onFlip}
        >
            <div className="flashcard-inner">
                {/* Front Side */}
                <div
                    className="flashcard-front"
                    style={{ borderColor: cardColor }}
                >
                    {frontType === 'word' ? renderWordSide() : renderDefinitionSide()}
                </div>

                {/* Back Side */}
                <div
                    className="flashcard-back"
                    style={{ borderColor: cardColor }}
                >
                    {frontType === 'word' ? renderDefinitionSide() : renderWordSide()}
                </div>
            </div>
        </div>
    );
};
