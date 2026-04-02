import { useEffect, useState } from "react";
import { languages } from "../utils/constants";
import { HomePageProps } from "../interfaces/rootProps";
import { ActivityBoard } from "../components/ActivityBoard";
import "../styles/HomePage.css";

export const HomePage: React.FC<HomePageProps> = ({ activeLanguages, isLoading, collections }) => {
    const [remainLanguages, setRemainLanguages] = useState<Array<any>>();
    const [selectedLanguage, setSelectedLanguage] = useState<any>();

    useEffect(() => {
        let list = new Array();
        if (activeLanguages && activeLanguages.length > 0) {
            const activeLanguageIds = new Set(
                activeLanguages.map((language) => language.id)
            );

            list = languages.filter(
                (language) => !activeLanguageIds.has(language.id)
            );
        }
        if (list.length > 0) setRemainLanguages(list);
        else setRemainLanguages(languages);
    }, [activeLanguages?.length]);

    if (isLoading) {
        return (
            <div className="homepage-container d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const hasActiveLanguages = activeLanguages && activeLanguages.length > 0;

    return (
        <div className="homepage-container">

            {/* Discover Section */}
            <div className={`discover-container ${!hasActiveLanguages ? 'mt-5' : ''}`}>
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

                {selectedLanguage && (
                    <div className="select-btn-overlay animation-fade-in">
                        <a
                            href={`/${selectedLanguage.code}/collections`}
                            className="btn btn-start-now"
                        >
                            Start learning {selectedLanguage.language}
                            <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                )}
            </div>

            {/* My Languages Section */}
            {hasActiveLanguages && (
                <div className="mt-5">
                    <h2 className="section-title">
                        <i className="fas fa-bookmark"></i>
                        My Languages
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

            {/* Activity Log Section */}
            {hasActiveLanguages && <ActivityBoard collections={collections} />}
        </div>
    );
};
