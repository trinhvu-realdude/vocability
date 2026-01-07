import { useEffect, useState } from "react";
import { languages } from "../utils/constants";
import { NoDataMessage } from "../components/NoDataMessage";
import { HomePageProps } from "../interfaces/rootProps";
import "../styles/HomePage.css";

export const HomePage: React.FC<HomePageProps> = ({ activeLanguages }) => {
    const [remainLanguages, setRemainLanguages] = useState<Array<any>>();
    const [selectedLanguage, setSelectedLanguage] = useState<any>();

    useEffect(() => {
        let list = new Array();
        if (activeLanguages.length > 0) {
            const activeLanguageIds = new Set(
                activeLanguages.map((language) => language.id)
            );

            list = languages.filter(
                (language) => !activeLanguageIds.has(language.id)
            );
        }
        if (list.length > 0) setRemainLanguages(list);
        else setRemainLanguages(languages);
    }, [activeLanguages.length]);

    return (
        <div className="homepage-container">
            {/* Hero Section */}
            {/* <div className="hero-section">
                <h1 className="hero-title">Vocability</h1>
                <p className="hero-subtitle">
                    Master your vocabulary with spaced repetition. Organize your learning, practice daily, and expand your horizons across multiple languages.
                </p>
            </div> */}

            {/* Discover Section */}
            <div className="discover-container">
                <div className="discover-header">
                    <h2 className="section-title justify-content-center">
                        <i className="fas fa-globe-americas"></i>
                        Discover New Languages
                    </h2>
                    <p className="text-muted">Choose a new language to start building your vocabulary collection.</p>
                </div>

                <div className="premium-select-wrapper">
                    <select
                        className="form-select premium-select"
                        value={selectedLanguage ? selectedLanguage.language : ""}
                        onChange={(event) => {
                            const language = event.target.value;
                            setSelectedLanguage(
                                languages.find((lang) => lang.language === language)
                            );
                        }}
                    >
                        <option value="">Choose a language</option>
                        {remainLanguages &&
                            remainLanguages.map((language) => (
                                <option key={language.id} value={language.language}>
                                    {language.language}
                                </option>
                            ))}
                    </select>
                </div>

                {selectedLanguage ? (
                    <div className="select-btn-overlay animation-fade-in">
                        <a
                            href={`/${selectedLanguage.code}/collections`}
                            className="btn btn-start-now"
                        >
                            Start Learning {selectedLanguage.language}
                            <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                ) : (
                    activeLanguages.length === 0 && (
                        <div className="mt-4">
                            <NoDataMessage message="🚀 Please choose a language to start your journey" />
                        </div>
                    )
                )}
            </div>

            {/* My Languages Section */}
            {activeLanguages && activeLanguages.length > 0 && (
                <div className="mt-5">
                    <h2 className="section-title">
                        <i className="fas fa-bookmark"></i>
                        My Vocabularies
                    </h2>
                    <div className="language-grid">
                        {activeLanguages.map((language) => (
                            <a
                                key={language.id}
                                href={`/${language.code}/collections`}
                                className="language-card-link"
                            >
                                <div className="language-card">
                                    <div className="flag-wrapper">
                                        <span className={`fi fi-${language.code}`}></span>
                                    </div>
                                    <div className="language-info">
                                        <span className="language-name">{language.language}</span>
                                    </div>
                                    <div className="go-icon">
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
