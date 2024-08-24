import { IDBPDatabase } from "idb";
import { MyDB, Word } from "../interfaces/model";
import { getCollectionById } from "./CollectionService";
import { getWordsByCollectionId } from "./WordService";

export const generateWordsForFlashCards = async (
    db: IDBPDatabase<MyDB>,
    selectedCollectionId: number,
    numberOfCards: number,
    setCardColor: React.Dispatch<React.SetStateAction<string>>
): Promise<Word[]> => {
    const collection = await getCollectionById(db, selectedCollectionId);
    setCardColor(collection ? collection.color : "");
    let words = await getWordsByCollectionId(db, selectedCollectionId);
    // Shuffle the words array
    words = words.sort(() => Math.random() - 0.5);

    // Determine the number of words to return
    const maxWords = Math.min(numberOfCards, words.length, 10);

    // Slice the array to get the desired number of words
    const selectedWords = words.slice(
        0,
        numberOfCards <= words.length ? numberOfCards : maxWords
    );
    return selectedWords;
};