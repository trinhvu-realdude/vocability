import { PageHeader } from "../../components/PageHeader";
import { VocabularyQuizPageProps } from "../../interfaces/practiceProps";
import { useLanguage } from "../../LanguageContext";

export const VocabularyQuizPage: React.FC<VocabularyQuizPageProps> = () => {
    const { translations } = useLanguage();
    return (
        <div className="container-list" id="vocabulary-quiz">
            <PageHeader content={translations["practice.quiz"]} />
        </div>
    );
};
