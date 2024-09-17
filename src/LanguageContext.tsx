// src/contexts/LanguageContext.tsx

import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { languageFiles } from "./locales";

type LanguageContextProps = {
    languageCode: string;
    translations: Record<string, string>;
    setLanguageCode: (code: string) => void;
    activeLanguages: any;
    setActiveLanguages: React.Dispatch<React.SetStateAction<any[]>>;
};

// Create Language Context
const LanguageContext = createContext<LanguageContextProps | null>(null);

// Hook to use the LanguageContext
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};

// Modify LanguageProvider to accept languageCode and setLanguageCode as props
type LanguageProviderProps = {
    children: ReactNode;
    languageCode: string;
    setLanguageCode: (code: string) => void;
    activeLanguages: any;
    setActiveLanguages: React.Dispatch<React.SetStateAction<any[]>>;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
    children,
    languageCode,
    setLanguageCode,
    activeLanguages,
    setActiveLanguages,
}) => {
    const [translations, setTranslations] = useState<Record<string, string>>(
        {}
    );

    useEffect(() => {
        const loadTranslations = async () => {
            const loadLanguage = languageFiles[languageCode]; // Fetch the translation loader function
            if (loadLanguage) {
                try {
                    const response = await loadLanguage(); // Call the loader function
                    setTranslations(response.default);
                } catch (error) {
                    console.error("Error loading translations:", error);
                }
            }
        };
        loadTranslations();
    }, [languageCode]);

    return (
        <LanguageContext.Provider
            value={{
                languageCode,
                translations,
                setLanguageCode,
                activeLanguages,
                setActiveLanguages,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};
