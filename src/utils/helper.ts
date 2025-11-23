import { Collection, Word } from "../interfaces/model";

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

export const sortCollectionsByFilter = (
    collections: Collection[],
    filterValue: string
) => {
    let sortedCollections;
    switch (filterValue) {
        case "a-z":
            sortedCollections = [...collections].sort((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
            break;

        case "z-a":
            sortedCollections = [...collections].sort((a, b) => {
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                    return -1;
                }
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return 1;
                }
                return 0;
            });
            break;
        case "newest-first":
            sortedCollections = [...collections].sort(
                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
            break;
        case "oldest-first":
            sortedCollections = [...collections].sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
            );
            break;
        default:
            sortedCollections = [...collections];
            break;
    }
    return sortedCollections;
};

export const handleTextToSpeech = async (
    text: string,
    language: string,
    selectedVoice: SpeechSynthesisVoice | undefined
) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;

    const voices = await getVoicesByLanguage(language);

    // if (!selectedVoice) {
    //     selectedVoice = voices.find((voice) => voice.default) || voices[0];
    // }

    // speech.voice = selectedVoice;

    speech.lang = language;

    window.speechSynthesis.speak(speech);
};

export const getVoicesByLanguage = async (language: string) => {
    // if (language === "us") language = "en";

    // Create a promise to wait for the voices to be available
    const loadVoices = () =>
        new Promise<SpeechSynthesisVoice[]>((resolve) => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                resolve(voices);
            } else {
                // Wait for the voices to be loaded
                window.speechSynthesis.onvoiceschanged = () => {
                    resolve(window.speechSynthesis.getVoices());
                };
            }
        });

    const voices = await loadVoices(); // Wait for the voices to load

    return voices.filter(
        (voice) => voice.lang.match(language) && !voice.default
    );
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
    languages: Array<any>,
    languageCode: string
): Promise<any> => {
    const currentLanguageId = await languages.find(
        (lang: any) => lang.code === languageCode
    )?.id;
    return currentLanguageId;
};

export const reorderActiveLanguages = (
    languages: Array<any>,
    languageCode: string
): any[] => {
    const currentLanguage = languages.find(
        (language) => language.code === languageCode
    );

    const otherLanguages = languages.filter(
        (language) => language.code !== languageCode
    );
    const reorderedLanguages = currentLanguage
        ? [currentLanguage, ...otherLanguages]
        : languages;

    return reorderedLanguages;
};

export const formatText = (text: string) => {
    // Break the text into lines
    const lines = text.split("\n");

    let formattedText = "";
    let insideList = false;

    lines.forEach((line) => {
        // Check if the line starts with a list indicator (e.g., "-", "*")
        if (line.startsWith("- ") || line.startsWith("* ")) {
            if (!insideList) {
                formattedText += "<ul style='margin-bottom: 0'>"; // Start the list
                insideList = true;
            }
            formattedText += `<li>${line.substring(2)}</li>`; // Add list item, removing the "- " or "* "
        } else {
            if (insideList) {
                formattedText += "</ul>"; // Close the list
                insideList = false;
            }
            formattedText += `${line}<br/>`; // Regular line with <br/> for line break
        }
    });

    // If the last line was a list, close it
    if (insideList) {
        formattedText += "</ul>";
    }

    return formattedText;
};
