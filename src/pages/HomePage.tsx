import { languages } from "../utils/constants";

export const HomePage = () => {
    return (
        <div className="container-list">
            <h4 className="text-center my-4">Languages</h4>

            <div className="text-center">
                <div className="d-flex flex-wrap justify-content-center">
                    {languages.map((language) => (
                        <div
                            key={language.id}
                            className="card-body text-center flag"
                        >
                            <a href={`/${language.code}/collections`}>
                                <span
                                    style={{
                                        cursor: "pointer",
                                        fontSize: "100px",
                                        borderRadius: "0.25rem",
                                    }}
                                    className={`fi fi-${language.code} mb-4`}
                                ></span>
                                <h5>{language.language}</h5>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
