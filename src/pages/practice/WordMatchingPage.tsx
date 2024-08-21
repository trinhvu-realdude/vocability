import { PageHeader } from "../../components/PageHeader";

export const WordMatchingPage = () => {
    return (
        <div className="container-list" id="word-matching">
            <PageHeader href={document.referrer} content="Word Matching" />
        </div>
    );
};
