import { DBSchema } from "idb";

export interface MyDB extends DBSchema {
    collections: {
        value: Collection;
        key: number;
    };
    words: {
        value: Word;
        key: number;
    };
}

export interface Collection {
    id?: number;
    name: string;
    color: string;
    numOfWords?: number;
    createdAt: Date;
    languageId: number;
}

export interface Word {
    id?: number;
    word: string;
    phonetic?: string;
    definitions: Definition[];
    definition: string;
    notes: string;
    partOfSpeech: string;
    isFavorite: boolean;
    collectionId?: number;
    createdAt: Date;
}

export interface Definition{
    definition: string;
    notes: string;
}

export interface WordDto extends Word {
    collection: Collection;
}

export type QuestionVocabularyQuiz = {
    id: string;
    question: string;
    answers: [
        {
            id: string;
            option: string;
            isCorrect: boolean;
        }
    ];
};
