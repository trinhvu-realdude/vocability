import { PageHeader } from "../../components/PageHeader";
import { CrosswordPuzzlePageProps } from "../../interfaces/practiceProps";
import { APP_NAME } from "../../utils/constants";
import { useLanguage } from "../../LanguageContext";

export const CrosswordPuzzlePage: React.FC<CrosswordPuzzlePageProps> = () => {
    document.title = `${APP_NAME} | Crossword Puzzles`;

    const { translations } = useLanguage();

    return (
        <div className="container-list" id="crossword-puzzles">
            <PageHeader content={translations["practice.crossword"]} />
        </div>
    );
};
