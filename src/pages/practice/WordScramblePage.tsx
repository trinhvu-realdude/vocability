import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";

export const WordScramblePage = () => {
    const { language } = useParams();

    return (
        <div className="container-list" id="word-scramble">
            <PageHeader
                href={`/${language}/practices`}
                content="Word Scramble"
            />
        </div>
    );
};
