import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "./model";

export interface PracticeLayoutProps {
    db: IDBPDatabase<MyDB> | undefined;
    collections?: Collection[];
    setCollections?: React.Dispatch<React.SetStateAction<Collection[]>>;
    setLanguageCode?: React.Dispatch<React.SetStateAction<string>>;
}

export interface FlashcardQuizPageProps extends PracticeLayoutProps { }

export interface CrosswordPuzzlePageProps extends PracticeLayoutProps { }

export interface VocabularyQuizPageProps extends PracticeLayoutProps { }

export interface WordScramblePageProps extends PracticeLayoutProps { }
