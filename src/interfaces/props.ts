import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "./model";

export interface CommonProps {
    db: IDBPDatabase<MyDB> | undefined;
    collections: Collection[];
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}

export interface WordDisplayProps {
    words: Word[];
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}

export type DeleteCollectionModalProps = {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
};

export type WordModalProps = {
    db: IDBPDatabase<MyDB> | undefined;
    word: Word;
    collection: Collection | undefined;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
};

export type Choice = {
    label: string;
    value: string;
    __isNew__: boolean;
};
