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
    createdAt: Date;
}

export interface Word {
    id?: number;
    word: string;
    definition: string;
    notes: string;
    collectionId?: number;
}
