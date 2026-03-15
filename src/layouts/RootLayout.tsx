import { useEffect, useState } from "react";
import { StorageBar } from "../components/StorageBar";
import { HomePage } from "../pages/HomePage";
import { getActiveLanguages } from "../services/CollectionService";

const RootLayout: React.FC = () => {
    const [activeLanguages, setActiveLanguages] = useState<Array<any>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchLanguages = async () => {
            setIsLoading(true);
            const languages = await getActiveLanguages();
            setActiveLanguages(languages);
            setIsLoading(false);
        };
        fetchLanguages();
    }, []);

    return (
        <div className="container my-4">
            <StorageBar />
            <HomePage activeLanguages={activeLanguages} isLoading={isLoading} />
        </div>
    );
};

export default RootLayout;
