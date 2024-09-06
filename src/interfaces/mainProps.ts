import { IDBPDatabase } from "idb";
import { Collection, MyDB, Word } from "./model";

export interface CommonProps {
    db: IDBPDatabase<MyDB> | undefined;
    collections: Collection[];
    collectionId?: string;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}

export interface MainLayoutProps extends CommonProps {}

export interface WordPageProps {
    db: IDBPDatabase<MyDB> | undefined;
    words: Word[];
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    setCurrentCollectionId: React.Dispatch<React.SetStateAction<string>>;
}

export interface WordDetailPageProps {
    db: IDBPDatabase<MyDB> | undefined;
}

export type CollectionModalProps = {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
    setCollection?: React.Dispatch<
        React.SetStateAction<Collection | undefined>
    >;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
};

export type SearchBarProps = {
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
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
    filterSorting?: FilterSortingOption;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
};

export type CollectionFormProps = {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
    setIsEditOrDelete: React.Dispatch<React.SetStateAction<boolean>>;
    setCollection?: React.Dispatch<
        React.SetStateAction<Collection | undefined>
    >;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
};

export type WordFormProps = {
    db: IDBPDatabase<MyDB> | undefined;
    word: Word;
    collection: Collection | undefined;
    setIsEditOrDelete: React.Dispatch<React.SetStateAction<boolean>>;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
    setWord?: React.Dispatch<React.SetStateAction<Word | undefined>>;
    setSynonyms?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    setAntonyms?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
};

export type DownloadDocumentModalProps = {
    collectionColor: string;
    filename: string;
    blobUrl?: string;
};

export type SortFilterProps = {
    displayWords?: Word[];
    filterSorting?: FilterSortingOption;
    setFilterSorting?: React.Dispatch<
        React.SetStateAction<FilterSortingOption | undefined>
    >;
    setFilteredWords?: React.Dispatch<React.SetStateAction<Word[]>>;
};

export type CollectionFilterProps = {
    collections?: Collection[];
    selectedCollection?: Collection;
    handleFilter?: (collection: Collection | null) => void;
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

export type NoDataMessageProps = {
    collectionName?: string;
    collectionColor?: string;
    message?: string;
};

export type EditWordObj = {
    word: string;
    phonetic: string | undefined;
    partOfSpeech: string;
    definition: string;
    notes: string;
};

export type ExternalWord = {
    word: string;
    phonetic: string;
    phonetics: [{ text: string; audio: string }];
    meanings: [
        {
            partOfSpeech: string;
            definitions: [
                {
                    definition: string;
                    example: string;
                }
            ];
            synonyms: [string];
            antonyms: [string];
        }
    ];
};
