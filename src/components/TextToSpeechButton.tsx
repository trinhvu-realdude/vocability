import { useState } from "react";
import { handleTextToSpeech } from "../utils/helper";
import { useLanguage } from "../LanguageContext";
import "../styles/TextToSpeechButton.css";

export const TextToSpeechButton: React.FC<{ word: string }> = ({ word }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { translations } = useLanguage();

    const handleClick = () => {
        handleTextToSpeech(word, translations["languageVoice"]);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 1000); // Reset after approx duration
    };

    return (
        <div
            className="btn btn-sm btn-icon-action"
            onClick={handleClick}
            title="Listen to pronunciation"
        >
            <i
                className="fas fa-volume-up"
                style={{
                    transition: "all 0.2s ease",
                    transform: isSpeaking ? "scale(1.1)" : "scale(1)",
                    color: isSpeaking ? "#DD5746" : "",
                }}
            ></i>
        </div>
    );
};
