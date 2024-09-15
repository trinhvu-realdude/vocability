import { useEffect, useState } from "react";
import { StorageBar } from "../components/StorageBar";
import { RootLayoutProps } from "../interfaces/rootProps";
import { HomePage } from "../pages/HomePage";
import { getActiveLanguages } from "../services/CollectionService";

const RootLayout: React.FC<RootLayoutProps> = ({ db }) => {
    const [activeLanguages, setActiveLanguages] = useState<Array<any>>([]);

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
