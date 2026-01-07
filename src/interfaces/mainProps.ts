import { IDBPDatabase } from "idb";
import { Collection, Definition, MyDB, Word } from "./model";
import { ToastType } from "../components/Toast";

export interface CommonProps {
    db: IDBPDatabase<MyDB> | undefined;
    collections: Collection[];
    collectionId?: string;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
    modalId?: string;
    initialWord?: string;
    onShowToast?: (message: string, type: ToastType) => void;
}

export interface MainLayoutProps extends CommonProps {
    setLanguageCode: React.Dispatch<React.SetStateAction<string>>;
}

export interface WordPageProps {
    db: IDBPDatabase<MyDB> | undefined;
    words: Word[];
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    setCurrentCollectionId: React.Dispatch<React.SetStateAction<string>>;
    onShowToast?: (message: string, type: ToastType) => void;
}

export interface WordDetailPageProps {
    db: IDBPDatabase<MyDB> | undefined;
    onShowToast?: (message: string, type: ToastType) => void;
}

export type CollectionModalProps = {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
    setIsEditOrDelete?: React.Dispatch<React.SetStateAction<boolean>>;
    setCollection?: React.Dispatch<
        React.SetStateAction<Collection | undefined>
    >;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    onShowToast?: (message: string, type: ToastType) => void;
};

export type SearchBarProps = {
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    viewMode?: 'grid' | 'list';
    setViewMode?: React.Dispatch<React.SetStateAction<'grid' | 'list'>>;
};

export type NavBarProps = {
    db: IDBPDatabase<MyDB> | undefined;
    languageCode?: string;
};

export type CollectionCardProps = {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
    onShowToast?: (message: string, type: ToastType) => void;
};

export type WordCardProps = {
    db: IDBPDatabase<MyDB> | undefined;
    word: Word;
    collection: Collection | undefined;
    filterSorting?: FilterSortingOption;
    setWords: React.Dispatch<React.SetStateAction<Word[]>>;
    voicesByLanguage: SpeechSynthesisVoice[];
    onShowToast?: (message: string, type: ToastType) => void;
    isHideDefinition?: boolean;
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
    onShowToast?: (message: string, type: ToastType) => void;
};

export type DownloadDocumentModalProps = {
    collectionColor: string;
    filename: string;
    blobUrl?: string;
};

export type SortFilterProps = {
    displayWords?: Word[];
    displayCollections?: Collection[];
    filterSorting?: FilterSortingOption;
    setFilterSorting?: React.Dispatch<
        React.SetStateAction<FilterSortingOption | undefined>
    >;
    setFilteredWords?: React.Dispatch<React.SetStateAction<Word[]>>;
    setFilteredCollections?: React.Dispatch<React.SetStateAction<Collection[]>>;
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
    color: string;
    __isNew__: boolean;
};

export type NoDataMessageProps = {
    message?: string;
};

export type EditWordObj = {
    word: string;
    phonetic: string | undefined;
    partOfSpeech: string;
    definitions: Definition[];
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
