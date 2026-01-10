import { PageHeader } from "../../components/PageHeader";
import { useLanguage } from "../../LanguageContext";

export const WordScramblePage = () => {
    const { translations } = useLanguage();
    return (
        <div className="container-list" id="word-scramble">
            <PageHeader content={translations["practice.scramble"]} />
        </div>
    );
};
