import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";

export const WordMatchingPage = () => {
    const { language } = useParams();
    return (
        <div className="container-list" id="word-matching">
            <PageHeader
                href={`/${language}/practices`}
                content="Word Matching"
            />
        </div>
    );
};
