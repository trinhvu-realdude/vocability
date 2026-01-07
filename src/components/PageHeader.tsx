import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export const PageHeader: React.FC<{
    href?: string;
    content: ReactNode;
    showBack?: boolean;
}> = ({ href, content, showBack = true }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (href) {
            navigate(href);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="d-flex align-items-center my-4">
            {showBack && (
                <button
                    onClick={handleBack}
                    className="btn btn-link p-0 text-dark border-0"
                    style={{ textDecoration: 'none' }}
                >
                    <i
                        className="fas fa-arrow-left"
                        style={{ fontSize: "1.2rem" }}
                    ></i>
                </button>
            )}
            <div className="flex-grow-1 text-center">
                <h4 className="m-0" style={{ fontWeight: 600 }}>{content}</h4>
            </div>
            {/* Empty div to balance the layout if showBack is true */}
            {showBack && <div style={{ width: "1.2rem" }}></div>}
        </div>
    );
};
