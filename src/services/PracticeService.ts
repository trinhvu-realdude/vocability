import { Word } from "../interfaces/model";
import { getCollectionById } from "./CollectionService";
import { getWordsByCollectionId } from "./WordService";

export const generateWordsForFlashCards = async (
    selectedCollectionId: string,
    numberOfCards: number,
    setCardColor: React.Dispatch<React.SetStateAction<string>>
): Promise<Word[]> => {
    const collection = await getCollectionById(selectedCollectionId);
    setCardColor(collection ? collection.color : "");
    let words = await getWordsByCollectionId(selectedCollectionId);
    // Shuffle the words array
    words = words.sort(() => Math.random() - 0.5);

    // Determine the number of words to return
    const maxWords = Math.min(numberOfCards, words.length, 10);

    // Slice the array to get the desired number of words
    const selectedWords = words
        .slice(0, numberOfCards <= words.length ? numberOfCards : maxWords)
        // .filter((word) => word.definition && word.definition !== "");
    return selectedWords;
};

export const generateQuestionsForVocabularyQuiz = async (): Promise<void> => {
    // This is currently a stub and not used by the VocabularyQuizPage
};
