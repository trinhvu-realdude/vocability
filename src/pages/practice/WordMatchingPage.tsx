import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { useLanguage } from "../../LanguageContext";
import { NoDataMessage } from "../../components/NoDataMessage";
import { PracticeLayoutProps } from "../../interfaces/practiceProps";
import { Word } from "../../interfaces/model";
import { getWordsByCollectionId } from "../../services/WordService";
import { getCollectionById } from "../../services/CollectionService";
import { APP_NAME } from "../../utils/constants";
import { handleTextToSpeech } from "../../utils/helper";
import "../../styles/WordMatchingPage.css";

const CARDS_PER_ROUND = 6;

interface MatchCard {
    id: string;
    wordId: string;
    text: string;
    type: "word" | "definition";
    isMatched: boolean;
    isSelected: boolean;
    isWrong: boolean;
}

type GameState = "idle" | "playing" | "complete";

export const WordMatchingPage: React.FC<PracticeLayoutProps> = ({ collections }) => {
    const { translations } = useLanguage();
    document.title = `Word Matching | ${APP_NAME}`;

    const [searchParams] = useSearchParams();
    const collectionIdParam = searchParams.get("collectionId");

    const [gameState, setGameState] = useState<GameState>("idle");
    const [allWords, setAllWords] = useState<Word[]>([]);
    const [wordCards, setWordCards] = useState<MatchCard[]>([]);
    const [definitionCards, setDefinitionCards] = useState<MatchCard[]>([]);
    const [selectedWordCard, setSelectedWordCard] = useState<MatchCard | null>(null);
    const [selectedDefCard, setSelectedDefCard] = useState<MatchCard | null>(null);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [cardColor, setCardColor] = useState("#DD5746");
    const [roundIndex, setRoundIndex] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [celebrationEmoji, setCelebrationEmoji] = useState("");

    // refs to avoid stale closure inside checkMatch
    const allWordsRef = React.useRef<Word[]>([]);
    const roundIndexRef = React.useRef(0);

    // Timer
    useEffect(() => {
        if (gameState !== "playing") return;
        const interval = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
        return () => clearInterval(interval);
    }, [gameState]);

    // Auto-start if collectionId is in URL
    useEffect(() => {
        if (collectionIdParam) {
            startGame(collectionIdParam);
        }
    }, [collectionIdParam]);

    const startGame = async (collectionId: string) => {
        const collection = await getCollectionById(collectionId);
        setCardColor(collection?.color ?? "#DD5746");

        let words = await getWordsByCollectionId(collectionId);
        words = words.filter((w) => w.definitions && w.definitions.length > 0);

        // Shuffle ONCE so every round gets a unique, non-overlapping 6-word slice
        const shuffled = [...words].sort(() => Math.random() - 0.5);

        setAllWords(shuffled);
        allWordsRef.current = shuffled;
        setMatchedPairs(0);
        setAttempts(0);
        setTimeElapsed(0);
        setRoundIndex(0);
        roundIndexRef.current = 0;
        setGameState("playing");
        prepareRound(shuffled, 0);
    };

    const prepareRound = (words: Word[], round: number) => {
        // Take a fixed, non-overlapping slice (words are already shuffled)
        const start = round * CARDS_PER_ROUND;
        let roundWords = words.slice(start, start + CARDS_PER_ROUND);

        // Safety: if exhausted (shouldn't happen with proper hasMore check), wrap with fresh shuffle
        if (roundWords.length === 0) {
            roundWords = [...words].sort(() => Math.random() - 0.5).slice(0, CARDS_PER_ROUND);
        }

        const wCards: MatchCard[] = roundWords.map((w, i) => ({
            id: `word-${round}-${i}-${w.id}`,
            wordId: w.id!,
            text: w.word,
            type: "word",
            isMatched: false,
            isSelected: false,
            isWrong: false,
        }));

        // Shuffle definitions column independently so order differs from words column
        const dCards: MatchCard[] = [...roundWords]
            .sort(() => Math.random() - 0.5)
            .map((w, i) => ({
                id: `def-${round}-${i}-${w.id}`,
                wordId: w.id!,
                text: w.definitions[0].definition,
                type: "definition",
                isMatched: false,
                isSelected: false,
                isWrong: false,
            }));

        setWordCards(wCards);
        setDefinitionCards(dCards);
        setSelectedWordCard(null);
        setSelectedDefCard(null);
    };

    const handleWordCardClick = (card: MatchCard) => {
        if (isChecking || card.isMatched) return;
        if (selectedWordCard?.id === card.id) {
            setSelectedWordCard(null);
            setWordCards((prev) =>
                prev.map((c) => (c.id === card.id ? { ...c, isSelected: false } : c))
            );
            return;
        }
        setWordCards((prev) =>
            prev.map((c) => ({ ...c, isSelected: c.id === card.id }))
        );
        setSelectedWordCard(card);
        if (selectedDefCard) checkMatch(card, selectedDefCard);
    };

    const handleDefCardClick = (card: MatchCard) => {
        if (isChecking || card.isMatched) return;
        if (selectedDefCard?.id === card.id) {
            setSelectedDefCard(null);
            setDefinitionCards((prev) =>
                prev.map((c) => (c.id === card.id ? { ...c, isSelected: false } : c))
            );
            return;
        }
        setDefinitionCards((prev) =>
            prev.map((c) => ({ ...c, isSelected: c.id === card.id }))
        );
        setSelectedDefCard(card);
        if (selectedWordCard) checkMatch(selectedWordCard, card);
    };

    const checkMatch = useCallback(
        (wordCard: MatchCard, defCard: MatchCard) => {
            setIsChecking(true);
            setAttempts((a) => a + 1);

            const isMatch = wordCard.wordId === defCard.wordId;

            if (isMatch) {
                const words = allWordsRef.current;
                const matchedWord = words.find((w) => w.id === wordCard.wordId);
                if (matchedWord) handleTextToSpeech(matchedWord.word, translations["languageVoice"]);

                setWordCards((prev) =>
                    prev.map((c) =>
                        c.id === wordCard.id ? { ...c, isMatched: true, isSelected: false } : c
                    )
                );
                setDefinitionCards((prev) =>
                    prev.map((c) =>
                        c.id === defCard.id ? { ...c, isMatched: true, isSelected: false } : c
                    )
                );
                setSelectedWordCard(null);
                setSelectedDefCard(null);

                setMatchedPairs((prev) => {
                    const nextMatched = prev + 1;
                    setWordCards((wc) => {
                        const totalPairs = wc.filter((c) => c.isMatched || c.id === wordCard.id).length;
                        const allDone = nextMatched >= wc.length;
                        if (allDone) {
                            const nextRound = roundIndexRef.current + 1;
                            const hasMore = nextRound * CARDS_PER_ROUND < allWordsRef.current.length;
                            setTimeout(() => {
                                if (hasMore) {
                                    setCelebrationEmoji("🎉");
                                    setTimeout(() => {
                                        setCelebrationEmoji("");
                                        roundIndexRef.current = nextRound;
                                        setRoundIndex(nextRound);
                                        setMatchedPairs(0);
                                        prepareRound(allWordsRef.current, nextRound);
                                    }, 1200);
                                } else {
                                    setGameState("complete");
                                }
                            }, 400);
                        }
                        void totalPairs; // suppress unused warning
                        return wc;
                    });
                    return nextMatched;
                });

                setIsChecking(false);
            } else {
                // Wrong – shake both cards
                setWordCards((prev) =>
                    prev.map((c) => (c.id === wordCard.id ? { ...c, isWrong: true } : c))
                );
                setDefinitionCards((prev) =>
                    prev.map((c) => (c.id === defCard.id ? { ...c, isWrong: true } : c))
                );

                setTimeout(() => {
                    setWordCards((prev) =>
                        prev.map((c) =>
                            c.id === wordCard.id
                                ? { ...c, isWrong: false, isSelected: false }
                                : c
                        )
                    );
                    setDefinitionCards((prev) =>
                        prev.map((c) =>
                            c.id === defCard.id
                                ? { ...c, isWrong: false, isSelected: false }
                                : c
                        )
                    );
                    setSelectedWordCard(null);
                    setSelectedDefCard(null);
                    setIsChecking(false);
                }, 600);
            }
        },
        [translations]
    );

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const accuracy =
        attempts > 0 ? Math.round((matchedPairs / attempts) * 100) : 100;
    const totalRounds = Math.ceil(allWords.length / CARDS_PER_ROUND);

    const renderGame = () => (
        <div className="wm-game-wrapper">
            {/* Round Progress */}
            <div className="wm-round-header">
                <div className="wm-round-badge" style={{ borderColor: cardColor, color: cardColor }}>
                    <i className="fas fa-layer-group me-2" />
                    {translations["wordMatching.round"]} {roundIndex + 1} / {totalRounds || 1}
                </div>
                <div className="wm-timer">
                    <i className="fas fa-clock me-2" />
                    {formatTime(timeElapsed)}
                </div>
                <div className="wm-attempts">
                    <i className="fas fa-crosshairs me-2" />
                    {attempts} {translations["wordMatching.attempts"]}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="wm-progress-bar-track">
                <div
                    className="wm-progress-bar-fill"
                    style={{
                        width: `${wordCards.length > 0 ? (matchedPairs / wordCards.length) * 100 : 0}%`,
                        background: `linear-gradient(90deg, ${cardColor} 0%, ${cardColor}cc 100%)`,
                    }}
                />
            </div>

            {/* Celebration overlay */}
            {celebrationEmoji && (
                <div className="wm-celebration">
                    <span>{celebrationEmoji}</span>
                    <span>{celebrationEmoji}</span>
                    <span>{celebrationEmoji}</span>
                </div>
            )}

            <div className="wm-board">
                {/* Words Column */}
                <div className="wm-column wm-words-column">
                    <div className="wm-column-label">
                        <i className="fas fa-font me-2" />
                        {translations["wordMatching.words"]}
                    </div>
                    <div className="wm-cards-list">
                        {wordCards.map((card) => (
                            <button
                                key={card.id}
                                className={`wm-card wm-word-card${card.isSelected ? " wm-selected" : ""}${card.isMatched ? " wm-matched" : ""}${card.isWrong ? " wm-wrong" : ""}`}
                                onClick={() => handleWordCardClick(card)}
                                disabled={card.isMatched || isChecking}
                                style={
                                    card.isSelected
                                        ? { borderColor: cardColor, background: `${cardColor}18` }
                                        : card.isMatched
                                        ? { borderColor: "#28a745", background: "rgba(40,167,69,0.08)" }
                                        : {}
                                }
                            >
                                {card.isMatched && (
                                    <i className="fas fa-check-circle wm-match-icon" />
                                )}
                                <span>{card.text}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Connector SVG column hidden for now – just spacing */}
                <div className="wm-connector">
                    <div className="wm-connector-line" />
                    <i className="fas fa-exchange-alt wm-connector-icon" />
                    <div className="wm-connector-line" />
                </div>

                {/* Definitions Column */}
                <div className="wm-column wm-definitions-column">
                    <div className="wm-column-label">
                        <i className="fas fa-align-left me-2" />
                        {translations["wordMatching.definitions"]}
                    </div>
                    <div className="wm-cards-list">
                        {definitionCards.map((card) => (
                            <button
                                key={card.id}
                                className={`wm-card wm-def-card${card.isSelected ? " wm-selected" : ""}${card.isMatched ? " wm-matched" : ""}${card.isWrong ? " wm-wrong" : ""}`}
                                onClick={() => handleDefCardClick(card)}
                                disabled={card.isMatched || isChecking}
                                style={
                                    card.isSelected
                                        ? { borderColor: cardColor, background: `${cardColor}18` }
                                        : card.isMatched
                                        ? { borderColor: "#28a745", background: "rgba(40,167,69,0.08)" }
                                        : {}
                                }
                            >
                                {card.isMatched && (
                                    <i className="fas fa-check-circle wm-match-icon" />
                                )}
                                <span>{card.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderComplete = () => (
        <div className="wm-results-wrapper">
            <div className="wm-results-card">
                <div className="wm-results-emoji">🏆</div>
                <h2 className="wm-results-title">{translations["wordMatching.completeTitle"]}</h2>
                <p className="wm-results-subtitle">{translations["wordMatching.completeSubtitle"]}</p>

                <div className="wm-results-stats">
                    <div className="wm-stat-box" style={{ borderTop: `4px solid ${cardColor}` }}>
                        <div className="wm-stat-value" style={{ color: cardColor }}>
                            {formatTime(timeElapsed)}
                        </div>
                        <div className="wm-stat-label">
                            <i className="fas fa-clock me-1" />
                            {translations["wordMatching.time"]}
                        </div>
                    </div>
                    <div className="wm-stat-box" style={{ borderTop: "4px solid #28a745" }}>
                        <div className="wm-stat-value" style={{ color: "#28a745" }}>
                            {attempts}
                        </div>
                        <div className="wm-stat-label">
                            <i className="fas fa-crosshairs me-1" />
                            {translations["wordMatching.attempts"]}
                        </div>
                    </div>
                    <div
                        className="wm-stat-box"
                        style={{
                            borderTop: `4px solid ${accuracy >= 70 ? "#28a745" : accuracy >= 50 ? "#ffc107" : "#dc3545"}`,
                        }}
                    >
                        <div
                            className="wm-stat-value"
                            style={{ color: accuracy >= 70 ? "#28a745" : accuracy >= 50 ? "#ffc107" : "#dc3545" }}
                        >
                            {accuracy}%
                        </div>
                        <div className="wm-stat-label">
                            <i className="fas fa-bullseye me-1" />
                            {translations["wordMatching.accuracy"]}
                        </div>
                    </div>
                    <div className="wm-stat-box" style={{ borderTop: "4px solid #6c757d" }}>
                        <div className="wm-stat-value" style={{ color: "#6c757d" }}>
                            {allWords.length}
                        </div>
                        <div className="wm-stat-label">
                            <i className="fas fa-layer-group me-1" />
                            {translations["wordMatching.totalWords"]}
                        </div>
                    </div>
                </div>

                <button
                    className="wm-play-again-btn"
                    style={{ background: `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)` }}
                    onClick={() => collectionIdParam && startGame(collectionIdParam)}
                >
                    <i className="fas fa-redo me-2" />
                    {translations["wordMatching.playAgain"]}
                </button>
            </div>
        </div>
    );

    return (
        <div className="container-list" id="word-matching">
            <PageHeader content={translations["practice.matching"]} />

            {gameState === "playing" && renderGame()}
            {gameState === "complete" && renderComplete()}

            {!collectionIdParam && gameState === "idle" && (
                <div className="wm-instruction-banner">
                    <i className="fas fa-info-circle me-2" />
                    {translations["wordMatching.selectCollection"]}
                </div>
            )}

            {collections?.length === 0 && (
                <NoDataMessage message="&#128511; You have no collection. Let's start to take note and practice vocabulary." />
            )}
        </div>
    );
};
