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

export const formatDate = (createdAt: Date) => {
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
    });

    const [weekday, month, day, year] = formattedDate
        .replace(",", "")
        .split(" ");
    return `${weekday}, ${day.replace(",", "")} ${month} ${year}`;
};

export const handleTextToSpeech = async (text: string) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    window.speechSynthesis.speak(speech);

    // check voice speech for each language
    window.speechSynthesis.onvoiceschanged = () => {
        console.log(window.speechSynthesis.getVoices());
    };
};
