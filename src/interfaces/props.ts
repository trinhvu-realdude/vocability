import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "./model";

export interface CommonProps {
    db: IDBPDatabase<MyDB> | undefined;
    collections: Collection[];
    collectionId?: string;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}

export interface WordPageProps {
    words: Word[];
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
    setCurrentCollectionId: React.Dispatch<React.SetStateAction<string>>;
}

export type CollectionModalProps = {
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

export type SearchBarProps = {
    words: Word[];
    setFilteredWords: React.Dispatch<React.SetStateAction<Word[]>>;
};

export type NavBarProps = {
    collections: Collection[];
};

export type CollectionCardProps = {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
};

export type WordCardProps = {
    db: IDBPDatabase<MyDB> | undefined;
    word: Word;
    collection: Collection | undefined;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
};

export type FilterSortingOption = {
    label: string;
    value: string;
};

export type Choice = {
    label: string;
    value: string;
    __isNew__: boolean;
};
