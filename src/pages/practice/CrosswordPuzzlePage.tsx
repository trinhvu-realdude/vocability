import { PageHeader } from "../../components/PageHeader";

export const CrosswordPuzzlePage = () => {
    return (
        <div className="container-list" id="crossword-puzzles">
            <PageHeader href={document.referrer} content="Crossword Puzzles" />
        </div>
    );
};
