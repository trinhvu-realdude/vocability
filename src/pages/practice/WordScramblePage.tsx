import { PageHeader } from "../../components/PageHeader";

export const WordScramblePage = () => {
    return (
        <div className="container-list" id="word-scramble">
            <PageHeader href={document.referrer} content="Word Scramble" />
        </div>
    );
};
