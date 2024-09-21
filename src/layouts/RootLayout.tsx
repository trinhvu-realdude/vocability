import { useEffect } from "react";
import { StorageBar } from "../components/StorageBar";
import { RootLayoutProps } from "../interfaces/rootProps";
import { HomePage } from "../pages/HomePage";
import { getActiveLanguages } from "../services/CollectionService";
import { useLanguage } from "../LanguageContext";

const RootLayout: React.FC<RootLayoutProps> = ({ db }) => {
    const { activeLanguages, setActiveLanguages } = useLanguage();

    useEffect(() => {
        const fetchLanguages = async () => {
            if (db) {
                const languages = await getActiveLanguages(db);
                setActiveLanguages(languages);
            }
        };
        fetchLanguages();
    }, []);

    return (
        <div className="container my-4">
            <StorageBar />
            <HomePage activeLanguages={activeLanguages} />
        </div>
    );
};

export default RootLayout;
