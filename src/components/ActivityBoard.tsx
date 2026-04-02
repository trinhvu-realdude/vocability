import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Word, Collection } from "../interfaces/model";
import { getWords } from "../services/WordService";
import { getCollections } from "../services/CollectionService";
import { getActiveUserId } from "../services/AuthService";
import { getSharedCollections } from "../services/ShareService";
import { languages } from "../utils/constants";
import "../styles/ActivityBoard.css";

interface ActivityBoardProps {
    collections?: Collection[];
}

interface ActivityData {
    [date: string]: Word[];
}

export const ActivityBoard: React.FC<ActivityBoardProps> = ({ collections: propCollections }) => {
    const navigate = useNavigate();
    const [words, setWords] = useState<Word[]>([]);
    const [collections, setCollections] = useState<Collection[]>(propCollections ?? []);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("rolling"); // "rolling" or "YYYY"

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const formatTooltipDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        }).replace(/,/g, '');
    };

    useEffect(() => {
        const fetchData = async () => {
            const uid = await getActiveUserId();
            // Only fetch words — collections are passed in as a prop (already fetched by AuthContext)
            const allWords = await getWords(uid);
            setWords(allWords);

            // Fallback: fetch collections ourselves if not passed as prop
            if (!propCollections) {
                const [owned, shared] = await Promise.all([
                    getCollections(uid),
                    getSharedCollections(undefined, uid),
                ]);
                setCollections([...owned, ...shared]);
            }
        };
        fetchData();
    }, []);

    const activityData = useMemo(() => {
        const data: ActivityData = {};
        words.forEach((word) => {
            if (word.created_at) {
                const dateStr = formatDate(new Date(word.created_at));
                if (!data[dateStr]) {
                    data[dateStr] = [];
                }
                data[dateStr].push(word);
            }
        });
        return data;
    }, [words]);

    const availableYears = useMemo(() => {
        const years = new Set<string>();
        const currentYear = new Date().getFullYear().toString();
        words.forEach(w => {
            if (w.created_at) {
                const year = new Date(w.created_at).getFullYear().toString();
                // Exclude current year because "Last year" rolling option already represents current activity well
                if (year !== currentYear) {
                    years.add(year);
                }
            }
        });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }, [words]);

    // Generate 12 months for the selected range
    const heatmapMonths = useMemo(() => {
        const months = [];
        const yearBase = selectedYear === "rolling" ? new Date().getFullYear() : parseInt(selectedYear);

        for (let m = 0; m < 12; m++) {
            const days = [];
            let startDay: Date;

            if (selectedYear === "rolling") {
                // Rolling: Current month is the last one
                const today = new Date();
                startDay = new Date(today.getFullYear(), today.getMonth() - (11 - m), 1);
            } else {
                startDay = new Date(yearBase, m, 1);
            }

            const month = startDay.getMonth();
            const year = startDay.getFullYear();
            const lastDay = new Date(year, month + 1, 0).getDate();

            for (let d = 1; d <= lastDay; d++) {
                days.push(new Date(year, month, d));
            }
            months.push({
                name: startDay.toLocaleString('default', { month: 'short' }),
                year: year,
                month: month,
                days: days,
                startOffset: new Date(year, month, 1).getDay()
            });
        }
        return months;
    }, [selectedYear]);

    // Stats calculations (re-using optimized logic)
    const stats = useMemo(() => {
        let totalWordsInRange = 0;
        const activeDaysSet = new Set<string>();

        // Determine range
        let filterFn: (date: Date) => boolean;
        if (selectedYear === "rolling") {
            const today = new Date();
            const yearAgo = new Date(today);
            yearAgo.setDate(today.getDate() - 364);
            filterFn = (d) => d >= yearAgo && d <= today;
        } else {
            const year = parseInt(selectedYear);
            filterFn = (d) => d.getFullYear() === year;
        }

        words.forEach(w => {
            if (w.created_at) {
                const d = new Date(w.created_at);
                if (filterFn(d)) {
                    totalWordsInRange++;
                    activeDaysSet.add(formatDate(d));
                }
            }
        });

        const sortedActiveDays = Object.keys(activityData).sort();
        let maxStreak = 0;
        let currentStreak = 0;

        if (sortedActiveDays.length > 0) {
            let prevDate = new Date(sortedActiveDays[0]);
            currentStreak = 1;
            maxStreak = 1;

            for (let i = 1; i < sortedActiveDays.length; i++) {
                const currDate = new Date(sortedActiveDays[i]);
                const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }
                maxStreak = Math.max(maxStreak, currentStreak);
                prevDate = currDate;
            }
        }

        return {
            total: totalWordsInRange,
            activeDays: activeDaysSet.size,
            maxStreak: maxStreak
        };
    }, [words, selectedYear, activityData]);

    const getColorClass = (count: number) => {
        if (count === 0) return "cell-empty";
        if (count <= 2) return "cell-low";
        if (count <= 5) return "cell-medium";
        if (count <= 10) return "cell-high";
        return "cell-very-high";
    };


    const getLanguageInfo = (collection_id?: string) => {
        if (!collection_id) return { language: "Unknown", code: "un" };
        const collection = collections.find((c) => c.id === collection_id);
        if (!collection) return { language: "Unknown", code: "un" };
        const lang = languages.find((l) => l.id === collection.language_id);
        return lang ? lang : { language: "Unknown", code: "un" };
    };

    const getCollectionInfo = (collection_id?: string) => {
        if (!collection_id) return { name: "Unknown", color: "#6a737d" };
        const collection = collections.find((c) => c.id === collection_id);
        return collection ? { name: collection.name, color: collection.color } : { name: "Unknown", color: "#6a737d" };
    };

    const selectedWords = selectedDate ? activityData[selectedDate] || [] : [];

    const handleWordClick = (word: Word) => {
        if (!word.id || !word.collection_id) return;
        const collection = collections.find(c => c.id === word.collection_id);
        if (collection) {
            const lang = languages.find(l => l.id === collection.language_id);
            if (lang) {
                navigate(`/${lang.code}/word/${word.id}`);
            }
        }
    };

    return (
        <div className="activity-board-container">
            <div className="activity-header">
                <div className="header-left">
                    <div className="title-group">
                        <span className="total-count">{stats.total} words</span>
                        <span className="year-desc"> in {selectedYear === "rolling" ? "the last year" : selectedYear}</span>
                    </div>
                </div>

                <div className="header-right">
                    <div className="stats-cards">
                        <div className="stat-card">
                            <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.activeDays}</span>
                                {" "}
                                <span className="stat-label">Active days</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon fire-icon"><i className="fas fa-fire"></i></div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.maxStreak}</span>
                                {" "}
                                <span className="stat-label">Max streak</span>
                            </div>
                        </div>
                    </div>
                    <div className="year-selector">
                        <select
                            className="form-select select-sm"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="rolling">Last year</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="heatmap-container-premium">
                <div className="heatmap-monthly-grid">
                    {heatmapMonths.map((month, mIndex) => (
                        <div key={mIndex} className="month-group">
                            <h4 className="month-name-header">{month.name}</h4>
                            <div className="month-days-grid">
                                {Array.from({ length: month.startOffset }).map((_, i) => (
                                    <div key={`offset-${i}`}></div>
                                ))}
                                {month.days.map((day, dIndex) => {
                                    const dateStr = formatDate(day);
                                    const dayWords = activityData[dateStr] || [];
                                    const count = dayWords.length;
                                    const isSelected = selectedDate === dateStr;

                                    return (
                                        <div
                                            key={dIndex}
                                            className={`heatmap-cell-premium ${getColorClass(count)} ${isSelected ? "selected" : ""}`}
                                            title={`${count} words added on ${formatTooltipDate(day)}`}
                                            onClick={() => setSelectedDate(dateStr)}
                                        >
                                            {isSelected && <div className="cell-pulse-effect"></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="heatmap-footer">
                    <div className="heatmap-legend">
                        <span>Less</span>
                        <div className="heatmap-cell-premium cell-empty"></div>
                        <div className="heatmap-cell-premium cell-low"></div>
                        <div className="heatmap-cell-premium cell-medium"></div>
                        <div className="heatmap-cell-premium cell-high"></div>
                        <div className="heatmap-cell-premium cell-very-high"></div>
                        <span>More</span>
                    </div>
                </div>
            </div>

            {selectedDate && (
                <div className="daily-details animation-fade-in">
                    <h3 className="daily-title">
                        <i className="fas fa-history me-2"></i>
                        Words added on {new Date(selectedDate).toDateString()}
                        <span className="badge-count-pill">{selectedWords.length}</span>
                    </h3>

                    {selectedWords.length > 0 ? (
                        <div className="daily-word-list">
                            {selectedWords.map((word, index) => {
                                const langInfo = getLanguageInfo(word.collection_id);
                                const collectionInfo = getCollectionInfo(word.collection_id);
                                return (
                                    <div
                                        key={index}
                                        className="daily-word-card clickable"
                                        onClick={() => handleWordClick(word)}
                                    >
                                        <div className="word-main">
                                            <span className="word-text">{word.word}</span>
                                        </div>
                                        <div className="word-meta">
                                            <span className={`fi fi-${langInfo.code} flag-icon-small`} title={langInfo.language}></span>
                                            <span
                                                className="badge-collection-refined"
                                                style={{
                                                    background: `${collectionInfo.color}15`,
                                                    color: collectionInfo.color,
                                                    border: `1px solid ${collectionInfo.color}40`
                                                }}
                                            >
                                                <i className="fas fa-folder me-1"></i>
                                                {collectionInfo.name}
                                            </span>
                                        </div>
                                        <div className="hover-indicator-arrow">
                                            <i className="fas fa-chevron-right"></i>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="no-data-box-premium">
                            <i className="fas fa-calendar-times mb-3"></i>
                            <p>No words added on this day.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
