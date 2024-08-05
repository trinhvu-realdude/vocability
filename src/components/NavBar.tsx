export const NavBar = () => {
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
                        <li className="nav-item mx-2">
                            <a
                                className="nav-link active"
                                href="/"
                                id="collections"
                            >
                                Collections
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};
