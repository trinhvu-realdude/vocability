import { useEffect, useState } from "react";
import { HomePageProps } from "../interfaces/rootProps";
import { languages } from "../utils/constants";
import { NoDataMessage } from "../components/NoDataMessage";

export const HomePage: React.FC<HomePageProps> = ({ activeLanguages }) => {
    const [remainLanguages, setRemainLanguages] = useState<Array<any>>();
    const [selectedLanguage, setSelectedLanguage] = useState<any>();

    useEffect(() => {
        let list = new Array();
        if (activeLanguages.length > 0) {
            const activeLanguageIds = new Set(
                activeLanguages.map((language) => language.id)
            );

            list = languages.filter(
                (language) => !activeLanguageIds.has(language.id)
            );
        }
        if (list.length > 0) setRemainLanguages(list);
        else setRemainLanguages(languages);
    }, [activeLanguages.length]);

    console.log(selectedLanguage);

    return (
        <div className="container-list">
            <h4 className="text-center my-2">Languages</h4>

            <div className="text-center">
                <div className="d-flex justify-content-center">
                    <select
                        className="form-select m-4 text-center custom-select"
                        value={selectedLanguage}
                        onChange={(event) => {
                            const language = event.target.value;
                            setSelectedLanguage(
                                languages.find(
                                    (lang) => lang.language === language
                                )
                            );
                        }}
                    >
                        <option value="">Choose a language</option>
                        {remainLanguages &&
                            remainLanguages.map((language) => (
                                <option
                                    key={language.id}
                                    value={language.language}
                                >
                                    {language.language}
                                </option>
                            ))}
                    </select>
                </div>

                {selectedLanguage && (
                    <a href={`/${selectedLanguage.code}/collections`}>
                        &#8618; Go to{" "}
                        <span style={{ color: "#dd5746" }}>
                            <strong>{selectedLanguage.language}</strong>{" "}
                        </span>
                    </a>
                )}

                {activeLanguages && activeLanguages.length > 0 ? (
                    activeLanguages.map((language) => (
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
                                <h5 className="w-50 mx-auto">
                                    {language.language}
                                </h5>
                            </a>
                        </div>
                    ))
                ) : (
                    <>
                        {!selectedLanguage && (
                            <NoDataMessage message="🚀 Please choose a language to take note firstly" />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
