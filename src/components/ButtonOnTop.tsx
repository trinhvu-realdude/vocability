import { useEffect, useState } from "react";

export const ButtonOnTop = () => {
    const [buttonOnTop, setButtonOnTop] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", () => {
            setButtonOnTop(window.scrollY >= 200 ? !buttonOnTop : buttonOnTop);
        });
    }, []);

    const handleToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
        <button
            className="gototop"
            onClick={handleToTop}
            style={{
                visibility: buttonOnTop ? "visible" : "hidden",
            }}
        >
            <i className="fa fa-angle-up"></i>
        </button>
    );
};
