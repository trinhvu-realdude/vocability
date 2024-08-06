import { NavBarProps } from "../interfaces/props";

export const NavBar: React.FC<NavBarProps> = ({ collections }) => {
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
                        {collections.length > 0 && (
                            <li className="nav-item dropdown mx-2">
                                <button
                                    className="btn dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Collections
                                </button>
                                <ul className="dropdown-menu">
                                    {collections.map((collection, index) => (
                                        <li key={index}>
                                            <a
                                                className="dropdown-item d-flex"
                                                href={`/collection/${collection.id}`}
                                            >
                                                <div
                                                    className="square"
                                                    style={{
                                                        height: "20px",
                                                        width: "20px",
                                                        backgroundColor:
                                                            collection.color,
                                                    }}
                                                ></div>
                                                <span className="ms-2">
                                                    {collection.name}
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        )}

                        <li className="nav-item mx-2">
                            <a
                                className="nav-link active"
                                href="/glossary"
                                style={{
                                    color: "#DD5746",
                                }}
                            >
                                Glossary
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};
