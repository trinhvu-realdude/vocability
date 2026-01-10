import { PageHeader } from "../../components/PageHeader";
import { useLanguage } from "../../LanguageContext";

export const MemoryCardPage = () => {
    const { translations } = useLanguage();
    return (
        <div className="container-list" id="memory-card">
            <PageHeader content={translations["practice.memory"]} />
        </div>
    );
};
