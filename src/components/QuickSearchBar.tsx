import { useState, useEffect, useRef } from "react";
import { IDBPDatabase } from "idb";
import { MyDB, Word } from "../interfaces/model";
import { getWordsByLanguageCode } from "../services/WordService";
import { useLanguage } from "../LanguageContext";
import "../styles/QuickSearchBar.css";
import { useNavigate } from "react-router-dom";

interface QuickSearchProps {
    db: IDBPDatabase<MyDB> | undefined;
    languageCode: string;
    onAddWord: (word: string) => void;
}

export const QuickSearchBar: React.FC<QuickSearchProps> = ({ db, languageCode, onAddWord }) => {
    const { translations, setSelectedWord } = useLanguage();
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Word[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [allWords, setAllWords] = useState<Word[]>([]);
    const navigate = useNavigate();

    // Use ref to handle clicking outside
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch all words on mount
    useEffect(() => {
        const fetchWords = async () => {
            if (db) {
                const words = await getWordsByLanguageCode(db, languageCode);
                setAllWords(words);
            }
        };
        fetchWords();
    }, [db, translations["language"]]); // Refresh when db or language changes

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults([]);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const results = allWords
            .filter(word => word.word.toLowerCase().includes(lowerTerm))
            .slice(0, 5); // Limit to 5 results

        setSearchResults(results);
    }, [searchTerm, allWords]);

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleWordClick = (word: Word, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default anchor behavior
        setSelectedWord(word);
        setShowResults(false);
        setSearchTerm("");
        navigate(`/${translations["language"]}/collection/${word.collectionId}#${word.id}`);

        // Also try to scroll element into view if we are already on the page or after nav
        // The hash in URL usually handles it, but sometimes React Router needs help if component mounts late.
        // But for now, just navigation is enough, let the hash handle scrolling if logic exists or user scrolls.
        // Actually, WordPage might strictly rely on hash for scrolling or just the border logic relies on selectedWord.
    };

    return (
        <div className="quick-search-container" ref={containerRef}>
            <div className="quick-search-wrapper">
                <div className="quick-search-icon">
                    <i className="fas fa-search"></i>
                </div>
                <input
                    type="text"
                    className="quick-search-input"
                    placeholder="Search or add word..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                />
            </div>

            {showResults && searchTerm && (
                <div className="quick-search-dropdown">
                    <ul className="quick-search-list">
                        {searchResults.map((word) => (
                            <li key={word.id} className="quick-search-item">
                                <a
                                    href={`/${translations["language"]}/collection/${word.collectionId}#${word.id}`}
                                    className="quick-search-link"
                                    onClick={(e) => handleWordClick(word, e)}
                                >
                                    <span className="word-text">{word.word}</span>
                                    <i className="fas fa-arrow-right arrow-icon"></i>
                                </a>
                            </li>
                        ))}

                        <li className="quick-search-item quick-search-add">
                            <button
                                className="quick-search-add-btn"
                                onClick={() => {
                                    onAddWord(searchTerm);
                                    setShowResults(false);
                                    setSearchTerm("");
                                }}
                                data-bs-toggle="modal"
                                data-bs-target="#global-add-word"
                            >
                                <i className="fas fa-plus-circle add-icon"></i>
                                <span>Add "<span className="text-decoration-underline">{searchTerm}</span>"</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};
