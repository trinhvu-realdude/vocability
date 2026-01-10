import { useNavigate, useParams } from "react-router-dom";
import { APP_NAME, practices } from "../utils/constants";
import { useState } from "react";
import { SelectionPracticeModal } from "../components/Modal/SelectionPracticeModal";
import { Collection } from "../interfaces/model";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../LanguageContext";
import "../styles/PracticePage.css";

import { ToastType } from "../components/Toast";

interface PracticePageProps {
    collections: Collection[] | undefined;
    onShowToast?: (message: string, type: ToastType) => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({ collections, onShowToast }) => {
    const { translations } = useLanguage();
    const { language } = useParams();
    const navigate = useNavigate();

    document.title = `${translations["practice.title"]} | ${APP_NAME}`;

    const [selectedPracticeHref, setSelectedPracticeHref] = useState<string | null>(null);

    const practicesLanguage = practices.find((lang) => lang.code === language);

    const handlePracticeClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        setSelectedPracticeHref(href);
        const modalElement = document.getElementById("collection-selection-practice-modal");
        if (modalElement) {
            // @ts-ignore
            const bootstrap = window.bootstrap;
            if (bootstrap) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        }
    };

    const handleCollectionSelect = (collectionId: number) => {
        if (selectedPracticeHref && language) {
            navigate(`/${language}${selectedPracticeHref}?collectionId=${collectionId}`);
        }
    };

    const getPracticeIcon = (name: string) => {
        if (name.includes("Flashcard")) return "fa-clone";
        if (name.includes("Crossword")) return "fa-puzzle-piece";
        if (name.includes("Scramble")) return "fa-font";
        if (name.includes("Quiz")) return "fa-vial";
        if (name.includes("Matching")) return "fa-link";
        if (name.includes("Memory")) return "fa-th-large";
        return "fa-magic";
    };

    return (
        <div className="practice-container" id="practices-list">
            <PageHeader
                content={translations["practice.title"]}
            />

            <div className="practice-grid">
                {practicesLanguage &&
                    practicesLanguage["list"].map((practice, index) => (
                        <div className="practice-card-wrapper" key={index}>
                            <a
                                href={`/${language}${practice.href}`}
                                className="practice-card"
                                onClick={(e) => handlePracticeClick(e, practice.href)}
                            >
                                <div className="practice-icon-wrapper">
                                    <i className={`fas ${getPracticeIcon(practice.name)}`}></i>
                                </div>
                                <div className="practice-info">
                                    <h5>{practice.name.replace(/[^a-zA-Z\s]/g, '').trim()}</h5>
                                    <p>{practice.description}</p>
                                </div>
                                <div className="practice-card-footer">
                                    <span>{translations["practice.startPractice"]}</span>
                                    <i className="fas fa-arrow-right"></i>
                                </div>
                            </a>
                        </div>
                    ))}
            </div>

            <SelectionPracticeModal
                collections={collections || []}
                onSelect={handleCollectionSelect}
                title={selectedPracticeHref ? practicesLanguage?.list.find(p => p.href === selectedPracticeHref)?.name : "Practice Setup"}
                onToast={onShowToast}
            />
        </div>
    );
};
