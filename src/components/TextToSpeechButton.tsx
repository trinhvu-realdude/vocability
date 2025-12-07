import { useState } from "react";
import { handleTextToSpeech } from "../utils/helper";
import { useLanguage } from "../LanguageContext";

export const TextToSpeechButton: React.FC<{ word: string }> = ({ word }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const { translations } = useLanguage();

    return (
        <div
            className="btn btn-sm"
            style={{
                padding: 0,
                margin: 0,
            }}
            onClick={() => {
                handleTextToSpeech(
                    word,
                    translations["languageVoice"],
                );
                setIsAnimating(true);

                // Remove the animation class after animation completes
                setTimeout(() => setIsAnimating(false), 600);
            }}
        >
            <i
                className={`fas fa-volume-up ${isAnimating ? "pulse-animation" : ""
                    }`}
                style={{
                    transition: "transform 0.6s ease-in-out",
                }}
            ></i>
        </div>
    );
};
