import { IDBPDatabase } from "idb";
import { MyDB } from "./model";

export interface RootLayoutProps {
    db: IDBPDatabase<MyDB>;
}

export interface HomePageProps {
    activeLanguages: Array<any>;
}
