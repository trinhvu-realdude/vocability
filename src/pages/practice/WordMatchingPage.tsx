import { PageHeader } from "../../components/PageHeader";
import { useLanguage } from "../../LanguageContext";

export const WordMatchingPage = () => {
    const { translations } = useLanguage();
    return (
        <div className="container-list" id="word-matching">
            <PageHeader content={translations["practice.matching"]} />
        </div>
    );
};
