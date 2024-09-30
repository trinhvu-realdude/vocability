import { useParams } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";

export const MemoryCardPage = () => {
    const { language } = useParams();

    return (
        <div className="container-list" id="memory-card">
            <PageHeader href={`/${language}/practices`} content="Memory Card" />
        </div>
    );
};
