import { useEffect } from "react";
import { NavBarProps } from "../interfaces/mainProps";
import { useLanguage } from "../LanguageContext";
import { getActiveLanguages } from "../services/CollectionService";
import { reorderActiveLanguages } from "../utils/helper";

export const NavBar: React.FC<NavBarProps> = ({
    db,
    collections,
    languageCode,
}) => {
    const { translations } = useLanguage();
    const { activeLanguages, setActiveLanguages } = useLanguage();

    useEffect(() => {
        const fetchLanguages = async () => {
            if (db) {
                const languages = await getActiveLanguages(db);
                const reorderedLanguages = reorderActiveLanguages(
                    languages,
                    translations["language"]
                );
                setActiveLanguages(reorderedLanguages);
            }
        };
        fetchLanguages();
    }, [translations["language"]]);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <a className="navbar-brand d-flex align-items-center" href="/">
                    <div>
                        <strong>
                            Voc
                            <span style={{ color: "#DD5746" }}>ability</span>
                        </strong>
                    </div>
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbar-toggle"
                    aria-controls="navbar-toggle"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                {languageCode !== "" ? (
                    <div
                        className="collapse navbar-collapse justify-content-end"
                        id="navbar-toggle"
                    >
                        <ul className="navbar-nav mb-2 mb-lg-0 text-center">
                            <li
                                className="nav-item dropdown mx-2"
                                style={{ cursor: "pointer" }}
                            >
                                <a
                                    className="nav-link active"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {translations["navbar.collections"]}
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a
                                            className="dropdown-item"
                                            href={`/${translations["language"]}/collections`}
                                        >
                                            <h6 className="dropdown-header">
                                                {
                                                    translations[
                                                        "navbar.collections.allCollections"
                                                    ]
                                                }
                                            </h6>
                                        </a>
                                    </li>
                                    {collections.map((collection, index) => (
                                        <li key={index}>
                                            <a
                                                className="dropdown-item d-flex"
                                                href={`/${translations["language"]}/collection/${collection.id}`}
                                            >
                                                <div
                                                    style={{
                                                        color: collection.color,
                                                    }}
                                                >
                                                    <i className="fas fa-layer-group"></i>
                                                </div>
                                                <span className="ms-2">
                                                    {collection.name}
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <a
                                            className="dropdown-item d-flex"
                                            href={`/${translations["language"]}/favorite`}
                                        >
                                            <div
                                                style={{
                                                    color: "#FFC000",
                                                }}
                                            >
                                                <i className="fas fa-layer-group"></i>
                                            </div>
                                            <span className="ms-2">
                                                {
                                                    translations[
                                                        "navbar.collections.favorite"
                                                    ]
                                                }
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            {/* <li className="nav-item mx-2">
                                <a
                                    className="nav-link active"
                                    href="/practices"
                                >
                                    {translations["navbar.practices"]}
                                </a>
                            </li> */}

                            <li className="nav-item mx-2">
                                <a
                                    className="nav-link active"
                                    href={`/${translations["language"]}/export`}
                                >
                                    {translations["navbar.export"]}
                                </a>
                            </li>

                            <li className="nav-item mx-2">
                                <a
                                    className="nav-link active"
                                    href={`/${translations["language"]}/glossary`}
                                    style={{
                                        color: "#DD5746",
                                    }}
                                >
                                    {translations["navbar.glossary"]}
                                </a>
                            </li>

                            {languageCode && (
                                <li
                                    className={`nav-item mx-2 ${
                                        activeLanguages.length > 0
                                            ? "dropdown"
                                            : ""
                                    }`}
                                    style={{ cursor: "pointer" }}
                                >
                                    <a
                                        className="nav-link active"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <span
                                            className={`fi fi-${languageCode}`}
                                            style={{
                                                borderRadius: "2px",
                                            }}
                                        ></span>
                                        <span className="ms-2 text-muted">
                                            <small>
                                                {languageCode !== "us"
                                                    ? languageCode
                                                    : "en"}
                                            </small>
                                        </span>
                                    </a>
                                    {activeLanguages &&
                                        activeLanguages.length > 0 && (
                                            <ul className="dropdown-menu">
                                                {activeLanguages.map(
                                                    (language: any) => (
                                                        <li key={language.id}>
                                                            <a
                                                                className={`dropdown-item d-flex ${
                                                                    language.code ===
                                                                    translations[
                                                                        "language"
                                                                    ]
                                                                        ? "active"
                                                                        : ""
                                                                }`}
                                                                href={`/${language.code}/collections`}
                                                            >
                                                                <div>
                                                                    <i
                                                                        className={`fi fi-${language.code}`}
                                                                        style={{
                                                                            borderRadius:
                                                                                "2px",
                                                                        }}
                                                                    ></i>
                                                                </div>{" "}
                                                                <span className="ms-2">
                                                                    {
                                                                        language.language
                                                                    }
                                                                </span>
                                                            </a>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
                                </li>
                            )}
                        </ul>
                    </div>
                ) : (
                    <div
                        className="collapse navbar-collapse justify-content-end"
                        id="navbar-toggle"
                    >
                        <div className="text-center mx-4">
                            Hi, what's good! 👋
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
