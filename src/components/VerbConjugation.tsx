import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { VerbConjugation as VerbConjugationType } from "../interfaces/mainProps";
import "../styles/VerbConjugation.css";

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
                                                    onClick={() => setPracticeData({ title: child.title, lines: child.data as string[] })}
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
interface PracticeModalProps {
    word: string;
    title: string;
    lines: string[];
    onClose: () => void;
}

const PracticeModal: React.FC<PracticeModalProps> = ({ word, title, lines, onClose }) => {
    const [answers, setAnswers] = useState<string[]>(new Array(lines.length).fill(""));
    const [isCorrect, setIsCorrect] = useState<boolean[]>(new Array(lines.length).fill(false));

    // Parse lines to get subject and verb
    // Expected format: "Subject <b>verb</b> extra"
    const parsedLines = lines.map(line => {
        const match = line.match(/^(.*?)<b>(.*?)<\/b>(.*)$/);
        if (match) {
            return {
                subject: match[1].trim(),
                verb: match[2].trim(),
                suffix: match[3].trim()
            };
        }
        return { subject: line, verb: "", suffix: "" };
    });

    const handleChange = (index: number, val: string) => {
        if (isCorrect[index]) return;

        const newAnswers = [...answers];
        newAnswers[index] = val;
        setAnswers(newAnswers);

        // Check correctness (case insensitive, trim spaces)
        if (val.trim().toLowerCase() === parsedLines[index].verb.toLowerCase()) {
            const newIsCorrect = [...isCorrect];
            newIsCorrect[index] = true;
            setIsCorrect(newIsCorrect);
        }
    };

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="vc-modal-overlay" onClick={onClose}>
            <div className="vc-modal-content" onClick={e => e.stopPropagation()}>
                <div className="vc-modal-header">
                    <h3 className="vc-modal-title">{title}</h3>
                    <button className="vc-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="vc-modal-body">
                    <div className="vc-practice-list">
                        <h3 className="vc-modal-title text-center mb-2">{word}</h3>
                        {parsedLines.map((item, idx) => (
                            <div key={idx} className="vc-practice-row">
                                <span className="vc-practice-subject">{item.subject}</span>
                                <div className="vc-input-wrapper">
                                    <input
                                        type="text"
                                        className={`vc-practice-input ${isCorrect[idx] ? "vc-input--correct" : ""}`}
                                        value={isCorrect[idx] ? item.verb : answers[idx]}
                                        onChange={e => handleChange(idx, e.target.value)}
                                        disabled={isCorrect[idx]}
                                        placeholder="Type verb..."
                                        autoFocus={idx === 0}
                                    />
                                    {isCorrect[idx] && <i className="fas fa-check-circle vc-correct-icon"></i>}
                                </div>
                                {item.suffix && <span className="vc-practice-suffix">{item.suffix}</span>}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="vc-modal-footer">
                    <button className="vc-done-btn" onClick={onClose}>
                        {isCorrect.every(c => c) ? "Excellent!" : "Close"}
                    </button>
                </div>
            </div>
        </div>
    );
};