import { Collection } from "./model";

export interface PracticeLayoutProps {
    collections?: Collection[];
    setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>;
    setLanguageCode?: React.Dispatch<React.SetStateAction<string>>;
}

export interface FlashcardQuizPageProps extends PracticeLayoutProps {}

export interface CrosswordPuzzlePageProps extends PracticeLayoutProps {}

export interface VocabularyQuizPageProps extends PracticeLayoutProps {}

export interface WordScramblePageProps extends PracticeLayoutProps {}

export interface WordMatchingPageProps extends PracticeLayoutProps {}
