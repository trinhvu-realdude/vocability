import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { useLanguage } from "../../LanguageContext";
import { NoDataMessage } from "../../components/NoDataMessage";
import { CrosswordPuzzlePageProps } from "../../interfaces/practiceProps";
import { Word } from "../../interfaces/model";
import { getWordsByCollectionId } from "../../services/WordService";
import { APP_NAME } from "../../utils/constants";
import "../../styles/CrosswordPuzzlePage.css";

// ─── Types ──────────────────────────────────────────────────────────────────

type Direction = "across" | "down";
type GameState = "selection" | "playing" | "complete";

interface PlacedWord {
    word: Word;
    row: number;
    col: number;
    direction: Direction;
    number: number;
}

interface Cell {
    letter: string;
    wordNumbers: number[];
    isBlack: boolean;
    startNumber?: number;
}

interface CrosswordGrid {
    cells: Cell[][];
    rows: number;
    cols: number;
    placedWords: PlacedWord[];
}

// ─── Crossword Generator ─────────────────────────────────────────────────────

const GRID_SIZE = 15;

function buildEmptyGrid(size: number): Cell[][] {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({
            letter: "",
            wordNumbers: [],
            isBlack: true,
            startNumber: undefined,
        }))
    );
}

function canPlace(grid: Cell[][], word: string, row: number, col: number, dir: Direction): boolean {
    const len = word.length;

    if (dir === "across") {
        if (col + len > GRID_SIZE) return false;
        // Check borders
        if (col > 0 && !grid[row][col - 1].isBlack) return false;
        if (col + len < GRID_SIZE && !grid[row][col + len].isBlack) return false;
        let hasIntersection = false;
        for (let i = 0; i < len; i++) {
            const cell = grid[row][col + i];
            if (cell.isBlack) {
                // Check above/below for conflicts
                if (row > 0 && !grid[row - 1][col + i].isBlack) return false;
                if (row < GRID_SIZE - 1 && !grid[row + 1][col + i].isBlack) return false;
            } else {
                if (cell.letter !== word[i]) return false;
                hasIntersection = true;
            }
        }
        return hasIntersection;
    } else {
        if (row + len > GRID_SIZE) return false;
        if (row > 0 && !grid[row - 1][col].isBlack) return false;
        if (row + len < GRID_SIZE && !grid[row + len][col].isBlack) return false;
        let hasIntersection = false;
        for (let i = 0; i < len; i++) {
            const cell = grid[row + i][col];
            if (cell.isBlack) {
                if (col > 0 && !grid[row + i][col - 1].isBlack) return false;
                if (col < GRID_SIZE - 1 && !grid[row + i][col + 1].isBlack) return false;
            } else {
                if (cell.letter !== word[i]) return false;
                hasIntersection = true;
            }
        }
        return hasIntersection;
    }
}

function placeWord(grid: Cell[][], word: string, row: number, col: number, dir: Direction, num: number) {
    const newGrid = grid.map(r => r.map(c => ({ ...c, wordNumbers: [...c.wordNumbers] })));
    for (let i = 0; i < word.length; i++) {
        const r = dir === "down" ? row + i : row;
        const c = dir === "across" ? col + i : col;
        newGrid[r][c].letter = word[i];
        newGrid[r][c].isBlack = false;
        newGrid[r][c].wordNumbers.push(num);
        if (i === 0) newGrid[r][c].startNumber = num;
    }
    return newGrid;
}

function generateCrossword(words: Word[]): CrosswordGrid {
    const cleanWords = words
        .map(w => ({ word: w, text: w.word.toLowerCase().replace(/[^a-z]/g, "") }))
        .filter(w => w.text.length >= 3 && w.text.length <= 12);

    if (cleanWords.length === 0) return { cells: [], rows: 0, cols: 0, placedWords: [] };

    let grid = buildEmptyGrid(GRID_SIZE);

    const placed: PlacedWord[] = [];
    let wordNum = 1;

    // Place first word in the center horizontally
    const first = cleanWords[0];
    const startCol = Math.floor((GRID_SIZE - first.text.length) / 2);
    const startRow = Math.floor(GRID_SIZE / 2);
    grid = placeWord(grid, first.text, startRow, startCol, "across", wordNum);
    placed.push({ word: first.word, row: startRow, col: startCol, direction: "across", number: wordNum });
    wordNum++;

    // Try to place remaining words
    const remaining = cleanWords.slice(1);
    let attempts = 0;
    let wordIdx = 0;

    while (wordIdx < remaining.length && attempts < 500) {
        attempts++;
        const candidate = remaining[wordIdx];
        let found = false;

        // Try to intersect with already-placed words
        for (const p of placed) {
            const pText = p.word.word.toLowerCase().replace(/[^a-z]/g, "");
            for (let ci = 0; ci < candidate.text.length && !found; ci++) {
                for (let pi = 0; pi < pText.length && !found; pi++) {
                    if (candidate.text[ci] !== pText[pi]) continue;

                    // Try opposite direction
                    const newDir: Direction = p.direction === "across" ? "down" : "across";
                    let r: number, c: number;
                    if (newDir === "down") {
                        r = p.direction === "across" ? p.row - ci : p.row + pi - ci;
                        c = p.direction === "across" ? p.col + pi : p.col - ci;
                    } else {
                        r = p.direction === "down" ? p.row + pi : p.row - ci;
                        c = p.direction === "down" ? p.col - ci : p.col + pi;
                    }

                    if (r < 0 || c < 0 || r >= GRID_SIZE || c >= GRID_SIZE) continue;

                    if (canPlace(grid, candidate.text, r, c, newDir)) {
                        grid = placeWord(grid, candidate.text, r, c, newDir, wordNum);
                        placed.push({ word: candidate.word, row: r, col: c, direction: newDir, number: wordNum });
                        wordNum++;
                        found = true;
                        wordIdx++;
                    }
                }
            }
            if (found) break;
        }

        if (!found) {
            // Shuffle and retry
            remaining.push(remaining.splice(wordIdx, 1)[0]);
            if (wordIdx >= remaining.length) break;
        }
    }

    // Trim grid to fit content
    let minRow = GRID_SIZE, maxRow = 0, minCol = GRID_SIZE, maxCol = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!grid[r][c].isBlack) {
                minRow = Math.min(minRow, r);
                maxRow = Math.max(maxRow, r);
                minCol = Math.min(minCol, c);
                maxCol = Math.max(maxCol, c);
            }
        }
    }

    const trimmedGrid = grid
        .slice(minRow, maxRow + 1)
        .map(row => row.slice(minCol, maxCol + 1));

    const adjustedPlaced = placed.map(p => ({
        ...p,
        row: p.row - minRow,
        col: p.col - minCol,
    }));

    return {
        cells: trimmedGrid,
        rows: trimmedGrid.length,
        cols: trimmedGrid[0]?.length ?? 0,
        placedWords: adjustedPlaced,
    };
}

// ─── Component ───────────────────────────────────────────────────────────────

export const CrosswordPuzzlePage: React.FC<CrosswordPuzzlePageProps> = ({ collections }) => {
    document.title = `Crossword Puzzles | ${APP_NAME}`;
    const { translations } = useLanguage();
    const [searchParams] = useSearchParams();
    const collectionIdParam = searchParams.get("collectionId");

    // Game state
    const [gameState, setGameState] = useState<GameState>("selection");
    const [crossword, setCrossword] = useState<CrosswordGrid | null>(null);
    const [userGrid, setUserGrid] = useState<string[][]>([]);
    const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
    const [activeDirection, setActiveDirection] = useState<Direction>("across");
    const [activeWordNum, setActiveWordNum] = useState<number | null>(null);
    const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
    const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Auto-start if collectionId is in URL
    useEffect(() => {
        if (collectionIdParam) {
            handleStartGame(collectionIdParam);
        }
    }, [collectionIdParam]);

    const handleStartGame = async (collectionId: string) => {
        setIsLoading(true);
        try {
            const words = await getWordsByCollectionId(collectionId);
            const usable = words.filter(w => w.definitions?.length > 0);
            if (usable.length < 4) {
                alert("Need at least 4 words with definitions to generate a puzzle!");
                return;
            }
            // Shuffle and limit
            const shuffled = [...usable].sort(() => Math.random() - 0.5).slice(0, 12);
            const cw = generateCrossword(shuffled);
            if (cw.placedWords.length === 0) {
                alert("Could not generate crossword. Try a different collection.");
                return;
            }

            setCrossword(cw);
            setUserGrid(cw.cells.map(row => row.map(cell => (cell.isBlack ? "#" : ""))));
            setSelectedCell(null);
            setActiveDirection("across");
            setActiveWordNum(null);
            setCompletedWords(new Set());
            setRevealedCells(new Set());
            setScore(0);
            setGameState("playing");
        } finally {
            setIsLoading(false);
        }
    };

    // Find which word is at a given cell in a given direction
    const getWordAtCell = useCallback((r: number, c: number, dir: Direction): PlacedWord | null => {
        if (!crossword) return null;
        // Walk back to find the start of the word
        let sr = r, sc = c;
        while (true) {
            const nr = dir === "down" ? sr - 1 : sr;
            const nc = dir === "across" ? sc - 1 : sc;
            if (nr < 0 || nc < 0 || crossword.cells[nr]?.[nc]?.isBlack !== false) break;
            sr = nr; sc = nc;
        }
        return crossword.placedWords.find(p => p.row === sr && p.col === sc && p.direction === dir) ?? null;
    }, [crossword]);

    // Keyboard handler
    useEffect(() => {
        if (gameState !== "playing" || !crossword) return;

        const handleKey = (e: KeyboardEvent) => {
            if (!selectedCell) return;
            const { r, c } = selectedCell;
            const key = e.key;

            if (key === "Tab") {
                e.preventDefault();
                setActiveDirection(d => d === "across" ? "down" : "across");
                return;
            }

            if (key === "ArrowRight") { e.preventDefault(); moveSelection(r, c, 0, 1, "across"); return; }
            if (key === "ArrowLeft") { e.preventDefault(); moveSelection(r, c, 0, -1, "across"); return; }
            if (key === "ArrowDown") { e.preventDefault(); moveSelection(r, c, 1, 0, "down"); return; }
            if (key === "ArrowUp") { e.preventDefault(); moveSelection(r, c, -1, 0, "down"); return; }

            if (key === "Backspace") {
                e.preventDefault();
                if (userGrid[r][c] && userGrid[r][c] !== "") {
                    const ng = userGrid.map(row => [...row]);
                    ng[r][c] = "";
                    setUserGrid(ng);
                } else {
                    // Move back
                    if (activeDirection === "across") moveSelection(r, c, 0, -1, "across");
                    else moveSelection(r, c, -1, 0, "down");
                }
                return;
            }

            if (/^[a-zA-Z]$/.test(key)) {
                e.preventDefault();
                if (crossword.cells[r][c].isBlack) return;
                if (revealedCells.has(`${r},${c}`)) return;

                const ng = userGrid.map(row => [...row]);
                ng[r][c] = key.toLowerCase();
                setUserGrid(ng);
                checkCompletion(ng);

                // Advance cursor
                if (activeDirection === "across") moveSelection(r, c, 0, 1, "across");
                else moveSelection(r, c, 1, 0, "down");
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [gameState, selectedCell, userGrid, activeDirection, crossword, revealedCells]);

    const moveSelection = (r: number, c: number, dr: number, dc: number, dir: Direction) => {
        if (!crossword) return;
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= crossword.rows || nc >= crossword.cols) return;
        if (crossword.cells[nr][nc].isBlack) return;
        setSelectedCell({ r: nr, c: nc });
        setActiveDirection(dir);
        const word = getWordAtCell(nr, nc, dir);
        setActiveWordNum(word?.number ?? null);
    };

    const handleCellClick = (r: number, c: number) => {
        if (!crossword || crossword.cells[r][c].isBlack) return;

        if (selectedCell?.r === r && selectedCell?.c === c) {
            // Toggle direction
            const newDir: Direction = activeDirection === "across" ? "down" : "across";
            const word = getWordAtCell(r, c, newDir);
            if (word) {
                setActiveDirection(newDir);
                setActiveWordNum(word.number);
            }
        } else {
            setSelectedCell({ r, c });
            const word = getWordAtCell(r, c, activeDirection) ?? getWordAtCell(r, c, activeDirection === "across" ? "down" : "across");
            if (word) {
                setActiveDirection(word.direction);
                setActiveWordNum(word.number);
            }
        }
    };

    const checkCompletion = (grid: string[][]) => {
        if (!crossword) return;
        const newCompleted = new Set<number>();
        for (const p of crossword.placedWords) {
            const text = p.word.word.toLowerCase().replace(/[^a-z]/g, "");
            let correct = true;
            for (let i = 0; i < text.length; i++) {
                const r = p.direction === "down" ? p.row + i : p.row;
                const c = p.direction === "across" ? p.col + i : p.col;
                if (grid[r][c] !== text[i]) { correct = false; break; }
            }
            if (correct) newCompleted.add(p.number);
        }
        setCompletedWords(newCompleted);
        setScore(newCompleted.size);

        if (newCompleted.size === crossword.placedWords.length) {
            setTimeout(() => setGameState("complete"), 500);
        }
    };

    const handleRevealCell = () => {
        if (!crossword || !selectedCell) return;
        const { r, c } = selectedCell;
        const correct = crossword.cells[r][c].letter;
        const ng = userGrid.map(row => [...row]);
        ng[r][c] = correct;
        const newRevealed = new Set(revealedCells);
        newRevealed.add(`${r},${c}`);
        setUserGrid(ng);
        setRevealedCells(newRevealed);
        checkCompletion(ng);
    };

    const handleRevealWord = () => {
        if (!crossword || !activeWordNum) return;
        const p = crossword.placedWords.find(pw => pw.number === activeWordNum);
        if (!p) return;
        const text = p.word.word.toLowerCase().replace(/[^a-z]/g, "");
        const ng = userGrid.map(row => [...row]);
        const newRevealed = new Set(revealedCells);
        for (let i = 0; i < text.length; i++) {
            const r = p.direction === "down" ? p.row + i : p.row;
            const c = p.direction === "across" ? p.col + i : p.col;
            ng[r][c] = text[i];
            newRevealed.add(`${r},${c}`);
        }
        setUserGrid(ng);
        setRevealedCells(newRevealed);
        checkCompletion(ng);
    };

    const handlePlayAgain = () => {
        if (collectionIdParam) handleStartGame(collectionIdParam);
    };

    // ─── Render helpers ─────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="container-list" id="crossword-puzzles">
                <PageHeader content={translations["practice.crossword"]} />
                <div className="d-flex justify-content-center mt-5">
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    if (gameState === "complete") {
        const total = crossword?.placedWords.length ?? 0;
        const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
        return (
            <div className="container-list" id="crossword-puzzles">
                <PageHeader content={translations["practice.crossword"]} />
                <div className="cw-results">
                    <div className="results-icon">🎉</div>
                    <h2 className="results-title">{translations["wordScramble.congratulations"]}</h2>
                    <div className="results-stats">
                        <div className="stat-card">
                            <div className="stat-value">{score}</div>
                            <div className="stat-label">{translations["flashcard.correctUpper"]}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{total - score}</div>
                            <div className="stat-label">{translations["flashcard.incorrectUpper"]}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{accuracy}%</div>
                            <div className="stat-label">{translations["wordScramble.accuracy"]}</div>
                        </div>
                    </div>
                    <div className="scramble-actions">
                        <button className="scramble-btn scramble-btn-submit" onClick={handlePlayAgain}>
                            <i className="fas fa-redo me-2"></i>
                            {translations["wordScramble.playAgain"]}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === "playing" && crossword) {
        // Determine highlighted cells (active word)
        const highlightedCells = new Set<string>();
        if (activeWordNum !== null) {
            const p = crossword.placedWords.find(pw => pw.number === activeWordNum);
            if (p) {
                const text = p.word.word.toLowerCase().replace(/[^a-z]/g, "");
                for (let i = 0; i < text.length; i++) {
                    const r = p.direction === "down" ? p.row + i : p.row;
                    const c = p.direction === "across" ? p.col + i : p.col;
                    highlightedCells.add(`${r},${c}`);
                }
            }
        }

        const acrossClues = crossword.placedWords.filter(p => p.direction === "across");
        const downClues = crossword.placedWords.filter(p => p.direction === "down");

        return (
            <div className="container-list" id="crossword-puzzles">
                <PageHeader content={translations["practice.crossword"]} />

                <div className="cw-layout">
                    {/* Grid */}
                    <div className="cw-grid-section">
                        {/* Active clue banner */}
                        {/* {activeClue && (
                            <div className="cw-active-clue">
                                <span className="cw-clue-number">{activeClue.number}{activeClue.direction === "across" ? "A" : "D"}</span>
                                <span className="cw-clue-text">{activeClue.word.definitions[0]?.definition ?? "?"}</span>
                            </div>
                        )} */}

                        {/* Score */}
                        <div className="cw-score-bar">
                            <span>{completedWords.size} / {crossword.placedWords.length} words</span>
                            <div className="cw-score-actions">
                                <button className="cw-hint-btn" onClick={handleRevealCell} disabled={!selectedCell}>
                                    <i className="fas fa-eye me-1"></i> Reveal Cell
                                </button>
                                <button className="cw-hint-btn" onClick={handleRevealWord} disabled={!activeWordNum}>
                                    <i className="fas fa-eye me-1"></i> Reveal Word
                                </button>
                            </div>
                        </div>

                        {/* Grid table */}
                        <div className="cw-grid-wrapper">
                            <table className="cw-grid">
                                <tbody>
                                    {crossword.cells.map((row, r) => (
                                        <tr key={r}>
                                            {row.map((cell, c) => {
                                                const key = `${r},${c}`;
                                                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                                                const isHighlighted = highlightedCells.has(key);
                                                const isRevealed = revealedCells.has(key);
                                                const startNum = cell.startNumber;

                                                // Check if user letter is right
                                                const userLetter = userGrid[r]?.[c] ?? "";
                                                const correctLetter = cell.letter;
                                                const isWrong = userLetter && !cell.isBlack && userLetter !== correctLetter;

                                                const isDone = cell.wordNumbers.some(num => completedWords.has(num));

                                                let cellClass = "cw-cell";
                                                if (cell.isBlack) cellClass += " black";
                                                else {
                                                    if (isSelected) cellClass += " selected";
                                                    else if (isHighlighted) cellClass += " highlighted";
                                                    if (isRevealed) cellClass += " revealed";
                                                    if (isWrong) cellClass += " wrong";
                                                    if (isDone && !isWrong) cellClass += " done";
                                                }

                                                return (
                                                    <td
                                                        key={c}
                                                        className={cellClass}
                                                        onClick={() => handleCellClick(r, c)}
                                                    >
                                                        {!cell.isBlack && (
                                                            <>
                                                                {startNum && <span className="cw-cell-number">{startNum}</span>}
                                                                <span className="cw-cell-letter">
                                                                    {userGrid[r]?.[c] ? userGrid[r][c].toUpperCase() : ""}
                                                                </span>
                                                            </>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tab hint */}
                        <p className="cw-tab-hint">
                            <i className="fas fa-keyboard me-1"></i>
                            Click a cell to select · Tab to flip direction · Arrows to move · Backspace to erase
                        </p>
                    </div>

                    {/* Clues panel */}
                    <div className="cw-clues-panel">
                        <div className="cw-clues-section">
                            <h4 className="cw-clues-title" style={{ marginBottom: 0 }}>Across</h4>
                            <ul className="cw-clues-list">
                                {acrossClues.map(p => (
                                    <li
                                        key={p.number}
                                        className={`cw-clue-item ${activeWordNum === p.number && activeDirection === "across" ? "active" : ""} ${completedWords.has(p.number) ? "done" : ""}`}
                                        onClick={() => {
                                            setSelectedCell({ r: p.row, c: p.col });
                                            setActiveDirection("across");
                                            setActiveWordNum(p.number);
                                        }}
                                    >
                                        <span className="cw-clue-num">{p.number}.</span>
                                        <span>{p.word.definitions[0]?.definition ?? "?"}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="cw-clues-section">
                            <h4 className="cw-clues-title" style={{ marginBottom: 0 }}>Down</h4>
                            <ul className="cw-clues-list">
                                {downClues.map(p => (
                                    <li
                                        key={p.number}
                                        className={`cw-clue-item ${activeWordNum === p.number && activeDirection === "down" ? "active" : ""} ${completedWords.has(p.number) ? "done" : ""}`}
                                        onClick={() => {
                                            setSelectedCell({ r: p.row, c: p.col });
                                            setActiveDirection("down");
                                            setActiveWordNum(p.number);
                                        }}
                                    >
                                        <span className="cw-clue-num">{p.number}.</span>
                                        <span>{p.word.definitions[0]?.definition ?? "?"}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Selection / no-data screen
    return (
        <div className="container-list" id="crossword-puzzles">
            <PageHeader content={translations["practice.crossword"]} />
            {collections?.length === 0 && (
                <NoDataMessage message="😓 You have no collection. Add some words to get started!" />
            )}
        </div>
    );
};
