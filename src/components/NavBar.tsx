import { NavBarProps } from "../interfaces/mainProps";
import { useLanguage } from "../LanguageContext";

export const NavBar: React.FC<NavBarProps> = ({
    collections,
    languageCode,
}) => {
    const { translations } = useLanguage();

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
                                            href={`/collection/${collection.id}`}
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
                                        href="/favorite"
                                    >
                                        <div
                                            // className="square"
                                            style={{
                                                color: "red",
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
                            <a className="nav-link active" href="/practices">
                                {translations["navbar.practices"]}
                            </a>
                        </li> */}

                        <li className="nav-item mx-2">
                            <a className="nav-link active" href="/export">
                                {translations["navbar.export"]}
                            </a>
                        </li>

                        <li className="nav-item mx-2">
                            <a
                                className="nav-link active"
                                href="/glossary"
                                style={{
                                    color: "#DD5746",
                                }}
                            >
                                {translations["navbar.glossary"]}
                            </a>
                        </li>

                        {languageCode && (
                            <li
                                className="nav-item dropdown mx-2"
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
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-lg-start">
                                    <li>
                                        <a
                                            className="dropdown-item d-flex"
                                            href=""
                                        ></a>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};
