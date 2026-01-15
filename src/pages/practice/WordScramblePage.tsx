import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { useLanguage } from "../../LanguageContext";
import { NoDataMessage } from "../../components/NoDataMessage";
import { WordScramblePageProps } from "../../interfaces/practiceProps";
import { Word } from "../../interfaces/model";
import { generateWordsForFlashCards } from "../../services/PracticeService";
import { APP_NAME } from "../../utils/constants";
import "../../styles/WordScramblePage.css";
import { handleTextToSpeech } from "../../utils/helper";

type GameState = 'selection' | 'playing' | 'gameOver' | 'complete';

interface LetterCard {
    letter: string;
    originalIndex: number;
    used: boolean;
}

export const WordScramblePage: React.FC<WordScramblePageProps> = ({
    db,
    collections,
}) => {
    const { translations } = useLanguage();
    document.title = `Word Scramble | ${APP_NAME}`;

    const [searchParams] = useSearchParams();
    const collectionIdParam = searchParams.get("collectionId");

    // Game state
    const [gameState, setGameState] = useState<GameState>('selection');
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [hearts, setHearts] = useState(3);
    const [timeLeft, setTimeLeft] = useState(20);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    // Word state
    const [scrambledLetters, setScrambledLetters] = useState<LetterCard[]>([]);
    const [userAnswer, setUserAnswer] = useState<string[]>([]);
    const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

    const currentWord = words[currentWordIndex];

    // Initialize game when collection is selected
    useEffect(() => {
        if (collectionIdParam && db) {
            handleStartGame(Number(collectionIdParam));
        }
    }, [collectionIdParam, db]);

    const handleStartGame = async (collectionId: number) => {
        if (db) {
            const wordsForGame = await generateWordsForFlashCards(
                db,
                collectionId,
                1000,
                () => { } // No color needed
            );

            if (wordsForGame.length > 0) {
                setWords(wordsForGame);
                setGameState('playing');
                setCurrentWordIndex(0);
                setHearts(3);
                setScore(0);
                setCorrectCount(0);
                setTimeLeft(20);
                prepareWord(wordsForGame[0]);
            }
        }
    };

    // Scramble word and prepare letter cards
    const prepareWord = (word: Word) => {
        const wordText = word.word.toLowerCase();
        const letters = wordText.split('');

        // Create letter cards (excluding spaces)
        const letterCards: LetterCard[] = [];
        letters.forEach((letter, index) => {
            if (letter !== ' ') {
                letterCards.push({
                    letter,
                    originalIndex: index,
                    used: false
                });
            }
        });

        // Scramble the letters
        const scrambled = [...letterCards].sort(() => Math.random() - 0.5);
        setScrambledLetters(scrambled);

        // Prepare answer slots
        const answerSlots = letters.map(letter => letter === ' ' ? ' ' : '');
        setUserAnswer(answerSlots);
        setAnswerStatus('idle');
        setTimeLeft(20);
    };

    // Timer countdown
    useEffect(() => {
        if (gameState !== 'playing' || timeLeft === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, timeLeft, currentWordIndex]);

    const handleTimeUp = () => {
        const newHearts = hearts - 1;
        setHearts(newHearts);
        setAnswerStatus('incorrect');

        // Show correct answer
        const correctAnswer = currentWord.word.toLowerCase();
        const letters = correctAnswer.split('');
        const answerSlots = letters.map(letter => letter === ' ' ? ' ' : letter);
        setUserAnswer(answerSlots);
        handleTextToSpeech(correctAnswer, translations["languageVoice"]);

        // Mark all letters as used
        const newScrambled = scrambledLetters.map(card => ({
            ...card,
            used: true
        }));
        setScrambledLetters(newScrambled);

        setTimeout(() => {
            if (newHearts <= 0) {
                setGameState('gameOver');
            } else {
                nextWord();
            }
        }, 2000); // Give user more time to see correct answer
    };

    // Handle letter card click
    const handleLetterClick = (index: number) => {
        if (answerStatus !== 'idle') return;

        const letter = scrambledLetters[index];
        if (letter.used) return;

        // Find next empty slot
        const emptyIndex = userAnswer.findIndex(slot => slot === '');
        if (emptyIndex === -1) return;

        // Update answer
        const newAnswer = [...userAnswer];
        newAnswer[emptyIndex] = letter.letter;
        setUserAnswer(newAnswer);

        // Mark letter as used
        const newScrambled = [...scrambledLetters];
        newScrambled[index].used = true;
        setScrambledLetters(newScrambled);
    };

    // Handle keyboard input
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameState !== 'playing' || answerStatus !== 'idle') return;

            const key = e.key.toLowerCase();

            // Backspace to remove last letter
            if (key === 'backspace') {
                e.preventDefault();
                handleClearLast();
                return;
            }

            // Enter to submit
            if (key === 'enter') {
                e.preventDefault();
                handleSubmit();
                return;
            }

            // Letter input - allow any character that exists in the scrambled set
            if (key.length === 1) {
                // Find unused letter card with this letter (exact match)
                let cardIndex = scrambledLetters.findIndex(
                    card => card.letter === key && !card.used
                );

                // If not found, try normalized match (e.g. user types 'e' for 'é')
                if (cardIndex === -1) {
                    const normalizedKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    cardIndex = scrambledLetters.findIndex(card => {
                        const normalizedCard = card.letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        return normalizedCard === normalizedKey && !card.used;
                    });
                }

                if (cardIndex !== -1) {
                    e.preventDefault();
                    handleLetterClick(cardIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameState, answerStatus, scrambledLetters, userAnswer]);

    // Handle answer slot click
    const handleAnswerSlotClick = (index: number) => {
        if (gameState !== 'playing' || answerStatus !== 'idle') return;

        const letterToRemove = userAnswer[index];
        // If empty or space, ignore
        if (!letterToRemove || letterToRemove === ' ') return;

        // Clear specific slot
        const newAnswer = [...userAnswer];
        newAnswer[index] = '';
        setUserAnswer(newAnswer);

        // Mark one instance of this letter as unused
        const newScrambled = [...scrambledLetters];
        const cardIndex = newScrambled.findIndex(
            card => card.letter === letterToRemove && card.used
        );

        if (cardIndex !== -1) {
            newScrambled[cardIndex].used = false;
        }
        setScrambledLetters(newScrambled);
    };

    const handleClearLast = () => {
        // Find last filled slot
        let lastFilledIndex = -1;
        for (let i = userAnswer.length - 1; i >= 0; i--) {
            if (userAnswer[i] !== '' && userAnswer[i] !== ' ') {
                lastFilledIndex = i;
                break;
            }
        }

        if (lastFilledIndex === -1) return;

        const letterToRemove = userAnswer[lastFilledIndex];

        // Clear from answer
        const newAnswer = [...userAnswer];
        newAnswer[lastFilledIndex] = '';
        setUserAnswer(newAnswer);

        // Mark letter as unused
        const newScrambled = [...scrambledLetters];
        const cardIndex = newScrambled.findIndex(
            card => card.letter === letterToRemove && card.used
        );
        if (cardIndex !== -1) {
            newScrambled[cardIndex].used = false;
        }
        setScrambledLetters(newScrambled);
    };

    const handleClearAll = () => {
        const answerSlots = currentWord.word.split('').map(letter => letter === ' ' ? ' ' : '');
        setUserAnswer(answerSlots);

        const newScrambled = scrambledLetters.map(card => ({ ...card, used: false }));
        setScrambledLetters(newScrambled);
    };

    const handleSubmit = () => {
        const userAnswerText = userAnswer.join('').toLowerCase();
        const correctAnswer = currentWord.word.toLowerCase();

        if (userAnswerText === correctAnswer) {
            handleTextToSpeech(correctAnswer, translations["languageVoice"]);
            setAnswerStatus('correct');
            setScore(score + 1);
            setCorrectCount(correctCount + 1);

            setTimeout(() => {
                nextWord();
            }, 1000);
        } else {
            setAnswerStatus('incorrect');

            setTimeout(() => {
                handleClearAll();
                setAnswerStatus('idle');
            }, 500); // Faster feedback to let user try again
        }
    };

    const nextWord = () => {
        if (currentWordIndex < words.length - 1) {
            const nextIndex = currentWordIndex + 1;
            setCurrentWordIndex(nextIndex);
            prepareWord(words[nextIndex]);
        } else {
            setGameState('complete');
        }
    };

    const handlePlayAgain = () => {
        if (collectionIdParam && db) {
            handleStartGame(Number(collectionIdParam));
        }
    };

    // Render hearts
    const renderHearts = () => {
        return (
            <div className="scramble-hearts">
                {[1, 2, 3].map(i => (
                    <span
                        key={i}
                        className={`scramble-heart ${i > hearts ? 'lost' : ''}`}
                    >
                        ❤️
                    </span>
                ))}
            </div>
        );
    };

    // Render game content
    const renderGame = () => {
        if (!currentWord) return null;

        const isAnswerComplete = userAnswer.every(slot => slot !== '');

        return (
            <div className="word-scramble-container">
                {/* Game Header */}
                <div className="scramble-game-header">
                    {renderHearts()}

                    <div className="scramble-timer-container">
                        <div className="timer-progress-bar">
                            <div
                                className={`timer-progress-fill ${timeLeft <= 5 ? 'warning' : ''}`}
                                style={{ width: `${(timeLeft / 20) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="scramble-score">
                        <div className="scramble-score-label">{translations["wordScramble.score"]}</div>
                        <div className="scramble-score-value">
                            {currentWordIndex + 1} / {words.length}
                        </div>
                    </div>
                </div>

                {/* Definition Card */}
                <div className="scramble-definition-card">
                    <div className="scramble-definition-label">{translations["wordScramble.definition"]}</div>
                    <div className="scramble-definition-text">
                        {currentWord.definitions[0]?.definition || 'No definition available'}
                    </div>
                </div>

                {/* Answer Area */}
                <div className="answer-area">
                    <div className="answer-label">{translations["wordScramble.yourAnswer"]}</div>
                    <div className="answer-slots">
                        {userAnswer.map((letter, index) => (
                            <div
                                key={index}
                                className={`answer-slot ${letter === ' ' ? 'space' :
                                    letter !== '' ? 'filled' : ''
                                    } ${answerStatus === 'correct' && letter !== ' ' ? 'correct' : ''} ${answerStatus === 'incorrect' && letter !== ' ' ? 'incorrect' : ''
                                    }`}
                                onClick={() => handleAnswerSlotClick(index)}
                            >
                                {letter !== ' ' && letter.toUpperCase()}
                            </div>
                        ))}
                    </div>

                    <div className="scramble-actions">
                        <button
                            className="scramble-btn scramble-btn-clear"
                            onClick={handleClearAll}
                            disabled={answerStatus !== 'idle'}
                        >
                            <i className="fas fa-eraser me-2"></i>
                            {translations["wordScramble.clear"]}
                        </button>
                        <button
                            className="scramble-btn scramble-btn-submit"
                            onClick={handleSubmit}
                            disabled={!isAnswerComplete || answerStatus !== 'idle'}
                        >
                            <i className="fas fa-check me-2"></i>
                            {translations["wordScramble.submit"]}
                        </button>
                    </div>
                </div>

                {/* Scrambled Letters */}
                <div className="scrambled-letters-container">
                    <div className="scrambled-letters">
                        {scrambledLetters.map((card, index) => (
                            <div
                                key={index}
                                className={`letter-card ${card.used ? 'used' : ''}`}
                                onClick={() => handleLetterClick(index)}
                            >
                                {card.letter.toUpperCase()}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        );
    };

    // Render results
    const renderResults = () => {
        const accuracy = words.length > 0 ? Math.round((correctCount / words.length) * 100) : 0;

        return (
            <div className="scramble-results">
                <div className="results-icon">
                    {gameState === 'complete' ? '🎉' : '💔'}
                </div>
                <h2 className="results-title">
                    {gameState === 'complete' ? translations["wordScramble.congratulations"] : translations["wordScramble.gameOver"]}
                </h2>

                <div className="results-stats">
                    <div className="stat-card">
                        <div className="stat-value">{correctCount}</div>
                        <div className="stat-label">{translations["flashcard.correctUpper"]}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{words.length - correctCount}</div>
                        <div className="stat-label">{translations["flashcard.incorrectUpper"]}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{accuracy}%</div>
                        <div className="stat-label">{translations["wordScramble.accuracy"]}</div>
                    </div>
                </div>

                <div className="scramble-actions">
                    <button
                        className="scramble-btn scramble-btn-submit"
                        onClick={handlePlayAgain}
                    >
                        <i className="fas fa-redo me-2"></i>
                        {translations["wordScramble.playAgain"]}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container-list" id="word-scramble">
            <PageHeader content={translations["practice.scramble"]} />

            {gameState === 'playing' && renderGame()}
            {(gameState === 'gameOver' || gameState === 'complete') && renderResults()}

            {collections?.length === 0 && (
                <NoDataMessage message="&#128511; You have no collection. Let's start to take note and practice vocabulary." />
            )}
        </div>
    );
};
