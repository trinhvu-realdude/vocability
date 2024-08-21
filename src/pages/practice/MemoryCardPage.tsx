import { PageHeader } from "../../components/PageHeader";

export const MemoryCardPage = () => {
    return (
        <div className="container-list" id="memory-card">
            <PageHeader href={document.referrer} content="Memory Card" />
        </div>
    );
};
