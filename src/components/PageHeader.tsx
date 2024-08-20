import { ReactNode } from "react";

export const PageHeader: React.FC<{
    href: string;
    content: ReactNode;
}> = ({ href, content }) => {
    return (
        <div className="d-flex align-items-center my-4">
            <a href={href} className="btn btn-link p-0">
                <i
                    className="fas fa-arrow-left"
                    style={{ fontSize: "16px" }}
                ></i>
            </a>
            <div className="flex-grow-1 text-center">
                <h4 className="m-0">{content}</h4>
            </div>
        </div>
    );
};
