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

export const handleTextToSpeech = async (text: string, language: string) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;

    // Wait for voices to be loaded
    await new Promise((resolve) => {
        const checkVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                resolve(voices);
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    const updatedVoices = window.speechSynthesis.getVoices();
                    if (updatedVoices.length > 0) {
                        resolve(updatedVoices);
                    }
                };
            }
        };
        checkVoices();
    });

    const voices = window.speechSynthesis.getVoices();
    // Find a voice that matches the specified language
    const selectedVoice = voices.find((voice) =>
        voice.lang.startsWith(language)
    );

    if (selectedVoice) {
        speech.voice = selectedVoice;
    } else {
        console.warn(`No voice found for language: ${language}`);
    }

    window.speechSynthesis.speak(speech);
};

export const getHintWord = async (text: string) => {
    // Helper function to replace characters with underscores in a word
    function maskWord(word: string) {
        const length = word.length;
        const maskCount = Math.ceil(length / 3); // Ensure at least one character is masked
        const indicesToMask = new Set<number>();

        while (indicesToMask.size < maskCount) {
            const randomIndex = Math.floor(Math.random() * length);
            indicesToMask.add(randomIndex);
        }

        return word
            .split("")
            .map((char, index) => (indicesToMask.has(index) ? "_" : char))
            .join("");
    }

    // Split text into words
    const words = text.split(" ");
    const wordCount = words.length;

    // Handle single word case
    if (wordCount === 1) {
        return maskWord(text);
    }

    // Handle phrase case
    const maskWordsCount = Math.ceil(wordCount / 3); // Ensure at least one word is masked
    const indicesToMask = new Set<number>();

    while (indicesToMask.size < maskWordsCount) {
        const randomIndex = Math.floor(Math.random() * wordCount);
        indicesToMask.add(randomIndex);
    }

    const result = words
        .map((word, index) =>
            indicesToMask.has(index) ? maskWord(word) : word
        )
        .join(" ");
    return result;
};

export const getCurrentLanguageId = async (
    languages: any,
    languageCode: string
) => {
    return languages.find((lang: any) => lang.code === languageCode)?.id;
};
