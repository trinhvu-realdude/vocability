import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "./interface";

export interface CommonProps {
    db: IDBPDatabase<MyDB> | undefined;
    collections: Collection[];
}

export type DeleteModalComponentProps = {
    db: IDBPDatabase<MyDB> | undefined;
    collection: Collection;
};

export type Choice = {
    label: string;
    value: string;
    __isNew__: boolean;
};
