import { useParams } from "react-router-dom";
import { APP_NAME, practices } from "../utils/constants";

export const PracticePage = () => {
    document.title = `${APP_NAME} | Practices`;

    const { language } = useParams();

    const practicesLanguage = practices.find((lang) => lang.code === language);

    return (
        <div className="container-list" id="practices-list">
            <h4 className="text-center my-4">Practices</h4>
            <div className="row">
                {practicesLanguage &&
                    practicesLanguage["list"].map((practice, index) => (
                        <div className="col-md-4 mb-4" key={index}>
                            <div className="card" id="card-practice">
                                <a
                                    href={`/${language}${practice.href}`}
                                    className="card-body text-center"
                                >
                                    <strong>{practice.name}</strong>
                                    <p className="mt-4">
                                        {practice.description}
                                    </p>
                                </a>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
