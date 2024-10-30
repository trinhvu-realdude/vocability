// src/contexts/LanguageContext.tsx

import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { languageFiles } from "./locales";
import { Word } from "./interfaces/model";

type LanguageContextProps = {
    languageCode: string;
    translations: Record<string, string>;
    setLanguageCode: (code: string) => void;
    activeLanguages: any;
    setActiveLanguages: React.Dispatch<React.SetStateAction<any[]>>;
    selectedWord: Word | undefined;
    setSelectedWord: React.Dispatch<React.SetStateAction<Word | undefined>>;
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
    selectedWord: Word | undefined;
    setSelectedWord: React.Dispatch<React.SetStateAction<Word | undefined>>;
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
    children,
    languageCode,
    setLanguageCode,
    activeLanguages,
    setActiveLanguages,
    selectedWord,
    setSelectedWord,
}) => {
    const [translations, setTranslations] = useState<Record<string, string>>(
        {}
    );

    useEffect(() => {
        const loadTranslations = async () => {
            console.log("Selected word: ", selectedWord);

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
                selectedWord,
                setSelectedWord,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
};
