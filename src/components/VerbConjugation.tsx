import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { VerbConjugation as VerbConjugationType } from "../interfaces/mainProps";
import "../styles/VerbConjugation.css";
import "../styles/AddWordModal.css";

interface VerbConjugationProps {
    data?: VerbConjugationType;
}

interface ChildrenGridProps {
    children: React.ReactNode;
}

const ChildrenGrid: React.FC<ChildrenGridProps> = ({ children }) => {
    const gridRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        // Reset heights first so we measure natural heights
        const titles = Array.from(
            grid.querySelectorAll<HTMLElement>(":scope > .vc-child-card > .vc-child-title")
        );
        titles.forEach(t => (t.style.height = ""));

        // Find tallest and sync all to it
        const maxH = Math.max(...titles.map(t => t.offsetHeight));
        if (maxH > 0) titles.forEach(t => (t.style.height = `${maxH}px`));
    });

    return (
        <div className="vc-children-grid" ref={gridRef}>
            {children}
        </div>
    );
};

export const VerbConjugation: React.FC<VerbConjugationProps> = ({ data }) => {
    const [expandedRoots, setExpandedRoots] = useState<Record<number, boolean>>({});
    const [practiceData, setPracticeData] = useState<{ title: string; lines: string[] } | null>(null);

    if (!data || !data.data) return null;

    const toggleRoot = (index: number) => {
        setExpandedRoots(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="vc-container">
            {data.data.filter(rootSection => rootSection.children && rootSection.children.length > 0).map((rootSection, rootIndex) => {
                const isExpanded = expandedRoots[rootIndex] !== false; // default expanded

                return (
                    <div key={rootIndex} className="vc-root-section">
                        {/* Root toggle header */}
                        <button
                            className="vc-root-btn"
                            onClick={() => toggleRoot(rootIndex)}
                            aria-expanded={isExpanded}
                        >
                            <span className="vc-root-label">{rootSection.root}</span>
                            <span className={`vc-chevron ${isExpanded ? "vc-chevron--open" : ""}`}>
                                <i className="fas fa-chevron-down"></i>
                            </span>
                        </button>

                        {/* Children grid */}
                        {isExpanded && (
                            <ChildrenGrid>
                                {rootSection.children.map((child, childIndex) => (
                                    <div key={childIndex} className="vc-child-card">
                                        <div className="vc-child-title">{child.title}</div>

                                        {child.type === "table" ? (
                                            <TableDisplay data={child.data as string[][]} />
                                        ) : (
                                            <>
                                                <LinesDisplay data={child.data as string[]} />
                                                <button
                                                    className="vc-practice-btn"
                                                    onClick={() => setPracticeData({ title: rootSection.root + ": " + child.title, lines: child.data as string[] })}
                                                    title="Practice this tense"
                                                >
                                                    <i className="fas fa-pen-nib"></i>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </ChildrenGrid>
                        )}
                    </div>
                );
            })}

            {practiceData && (
                <PracticeModal
                    word={data.word}
                    title={practiceData.title}
                    lines={practiceData.lines}
                    onClose={() => setPracticeData(null)}
                />
            )}
        </div>
    );
};

/* ── Table renderer ─────────────────────────────────────────── */
const TableDisplay: React.FC<{ data: string[][] }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const [headerRow, ...bodyRows] = data;

    return (
        <div className="vc-table-wrapper">
            <table className="vc-table">
                <thead>
                    <tr>
                        {headerRow.map((cell, i) => (
                            <th key={i} className="vc-th">{cell}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {bodyRows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="vc-tr">
                            {row.map((cell, colIndex) => (
                                colIndex === 0 ? (
                                    <th key={colIndex} className="vc-td vc-td--row-header">{cell}</th>
                                ) : (
                                    <td
                                        key={colIndex}
                                        className="vc-td"
                                        dangerouslySetInnerHTML={{ __html: cell }}
                                    />
                                )
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

/* ── Lines renderer ─────────────────────────────────────────── */
const LinesDisplay: React.FC<{ data: string[] }> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <ul className="vc-lines">
            {data.map((line, i) => (
                <li
                    key={i}
                    className="vc-line"
                    dangerouslySetInnerHTML={{ __html: line }}
                />
            ))}
        </ul>
    );
};

/* ── Practice Modal ─────────────────────────────────────────── */
const PRONOUNS = [
    "i", "you", "he", "she", "it", "we", "they",
    "yo", "tú", "él", "ella", "usted", "nosotros", "nosotras", "vosotros", "vosotras", "ellos", "ellas", "ustedes",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
    "ich", "du", "er", "sie", "es", "wir", "ihr", "Sie",
    "io", "tu", "lui", "lei", "noi", "voi", "loro",
    "eu", "ele", "ela", "você", "nós", "vós", "eles", "elas", "vocês"
];

interface Segment {
    type: "text" | "input";
    value: string;
}

interface PracticeModalProps {
    word: string;
    title: string;
    lines: string[];
    onClose: () => void;
}

const PracticeModal: React.FC<PracticeModalProps> = ({ word, title, lines, onClose }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isCorrect, setIsCorrect] = useState<Record<string, boolean>>({});

    const parseLineToSegments = (line: string): Segment[] => {
        // Remove <b> tags but keep the text
        const cleanLine = line.replace(/<\/?b>/g, "").trim();

        // 1. French apostrophe subjects (j', j')
        const apostropheMatch = cleanLine.match(/^([jJ]')(.+)$/);
        if (apostropheMatch) {
            return [
                { type: "text", value: apostropheMatch[1] },
                { type: "input", value: apostropheMatch[2].trim() }
            ];
        }

        // 2. Pronoun subjects
        const words = cleanLine.split(/\s+/);
        const firstWord = words[0].toLowerCase();

        if (PRONOUNS.includes(firstWord) || firstWord.includes("/")) {
            const subjectEndIdx = cleanLine.indexOf(" ");
            if (subjectEndIdx !== -1) {
                return [
                    { type: "text", value: cleanLine.substring(0, subjectEndIdx + 1) },
                    { type: "input", value: cleanLine.substring(subjectEndIdx + 1).trim() }
                ];
            }
        }

        // 3. Fallback: hide everything
        return [{ type: "input", value: cleanLine }];
    };

    const parsedLines = lines.map(line => parseLineToSegments(line));

    const handleChange = (lineIdx: number, segIdx: number, val: string, correctValue: string) => {
        const key = `${lineIdx}-${segIdx}`;
        if (isCorrect[key]) return;

        setAnswers(prev => ({ ...prev, [key]: val }));

        if (val.trim().toLowerCase() === correctValue.toLowerCase()) {
            setIsCorrect(prev => ({ ...prev, [key]: true }));
        }
    };

    const isLineComplete = (lineIdx: number) => {
        return parsedLines[lineIdx].every((seg, segIdx) =>
            seg.type === "text" || isCorrect[`${lineIdx}-${segIdx}`]
        );
    };

    const allCorrect = parsedLines.every((_, lineIdx) => isLineComplete(lineIdx));

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="vc-modal-overlay" onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()} style={{ width: "90%", maxWidth: "550px" }}>
                <div className="modal-content word-modal-content">
                    <div className="word-modal-header" style={{ backgroundColor: "#DD5746" }}>
                        <h5 className="word-modal-title">
                            {title}
                        </h5>
                        <button type="button" className="btn btn-sm word-modal-close" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="word-modal-body">
                        <div className="vc-practice-list">
                            <h3 className="word-modal-title text-center mb-2" style={{ color: "#2d3436", textShadow: "none", justifyContent: "center" }}>
                                {word}
                            </h3>
                            {parsedLines.map((segments, lineIdx) => (
                                <div key={lineIdx} className="vc-practice-row">
                                    <div className="vc-segments-container">
                                        {segments.map((segment, segIdx) => {
                                            const key = `${lineIdx}-${segIdx}`;
                                            if (segment.type === "text") {
                                                return <span key={segIdx} className="vc-segment-text">{segment.value}</span>;
                                            } else {
                                                return (
                                                    <div key={segIdx} className="vc-segment-input-wrapper">
                                                        <input
                                                            type="text"
                                                            className={`vc-segment-input ${isCorrect[key] ? "vc-input--correct" : ""}`}
                                                            value={isCorrect[key] ? segment.value : (answers[key] || "")}
                                                            onChange={e => handleChange(lineIdx, segIdx, e.target.value, segment.value)}
                                                            disabled={isCorrect[key]}
                                                            placeholder="..."
                                                            autoFocus={lineIdx === 0 && segIdx === 0}
                                                        />
                                                        {isCorrect[key] && <i className="fas fa-check-circle vc-correct-mini-icon"></i>}
                                                    </div>
                                                );
                                            }
                                        })}
                                        {/* {isLineComplete(lineIdx) && <i className="fas fa-check-circle vc-line-correct-icon"></i>} */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="word-modal-footer">
                        <button
                            type="button"
                            className={`btn ${allCorrect ? "btn-success" : "btn-outline-secondary"}`}
                            onClick={onClose}
                        >
                            {allCorrect ? (
                                <><i className="fas fa-star me-1"></i>Excellent!</>
                            ) : (
                                <><i className="fas fa-times me-1"></i>Close</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};