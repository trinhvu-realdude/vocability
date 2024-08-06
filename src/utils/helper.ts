import { Word } from "../interfaces/model";

export const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const sortWordsByFilter = (words: Word[], filterValue: string) => {
    let sortedWords;
    switch (filterValue) {
        case "a-z":
            sortedWords = [...words].sort((a, b) => {
                if (a.word.toLowerCase() < b.word.toLowerCase()) {
                    return -1;
                }
                if (a.word.toLowerCase() > b.word.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
            break;

        case "z-a":
            sortedWords = [...words].sort((a, b) => {
                if (a.word.toLowerCase() > b.word.toLowerCase()) {
                    return -1;
                }
                if (a.word.toLowerCase() < b.word.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
            break;
        case "newest-first":
            sortedWords = [...words].sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
            break;
        case "oldest-first":
            sortedWords = [...words].sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            );
            break;
        default:
            sortedWords = [...words];
            break;
    }
    return sortedWords;
};
