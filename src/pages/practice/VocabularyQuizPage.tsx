import { PageHeader } from "../../components/PageHeader";

export const VocabularyQuizPage = () => {
    return (
        <div className="container-list" id="vocabulary-quiz">
            <PageHeader href={document.referrer} content="Vocabulary Quiz" />
        </div>
    );
};
