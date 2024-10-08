import { PageHeader } from "../../components/PageHeader";
import { PracticeMessage } from "../../components/PracticeMessage";
import { CrosswordPuzzlePageProps } from "../../interfaces/practiceProps";
import { getWords } from "../../services/WordService";
import { APP_NAME } from "../../utils/constants";

export const CrosswordPuzzlePage: React.FC<CrosswordPuzzlePageProps> = ({
    db,
}) => {
    document.title = `${APP_NAME} | Crossword Puzzles`;

    const handleGeneratePuzzle = async () => {
        if (db) {
            let words = (await getWords(db))
                .filter((word) => word.word.trim().split(" ").length <= 2)
                .sort(() => Math.random() - 0.5);

            if (words.length >= 10) {
                words = words.slice(0, 10);
            } else {
                console.log(words.length);
            }
            console.log(words);
        }
    };

    return (
        <div className="container-list" id="crossword-puzzles">
            <PageHeader href="/practices" content="Crossword Puzzles" />

            <div className="text-center my-4">
                <button
                    className="btn btn-outline-success mb-4"
                    onClick={handleGeneratePuzzle}
                >
                    Generate puzzle
                </button>

                <PracticeMessage message="🧩 Click Generate puzzle and start to solve puzzle with your noted vocabulary" />
            </div>
        </div>
    );
};
