import { useEffect, useState } from "react";
import { StorageBar } from "../components/StorageBar";
import { HomePage } from "../pages/HomePage";
import { getActiveLanguages } from "../services/CollectionService";

const RootLayout: React.FC = () => {
    const [activeLanguages, setActiveLanguages] = useState<Array<any>>([]);

    useEffect(() => {
        const fetchLanguages = async () => {
            const languages = await getActiveLanguages();
            setActiveLanguages(languages);
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
