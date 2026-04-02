import { Collection } from "../interfaces/model";

export interface RootLayoutProps { }

export interface HomePageProps {
    activeLanguages: Array<any>;
    isLoading: boolean;
    collections?: Collection[];
}
