import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "./model";

export interface PracticeLayoutProps {
    db: IDBPDatabase<MyDB> | undefined;
    collections: Collection[];
}

export interface FlashcardQuizPageProps extends PracticeLayoutProps {}
