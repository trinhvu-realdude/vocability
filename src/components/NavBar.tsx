import { useEffect, useState } from "react";
import { NavBarProps } from "../interfaces/mainProps";
import { useLanguage } from "../LanguageContext";
import { getActiveLanguages } from "../services/CollectionService";
import { reorderActiveLanguages } from "../utils/helper";
import "../styles/NavBar.css";
import { QuickSearchBar } from "./QuickSearchBar";
import { useAuth } from "../contexts/AuthContext";

export const NavBar: React.FC<NavBarProps> = ({
    languageCode,
    onQuickAddWord,
}) => {
    const { user, signOut } = useAuth();
    const { translations } = useLanguage();
    const { activeLanguages, setActiveLanguages } = useLanguage();
    const [scrolled, setScrolled] = useState(false);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "there";
    const avatarUrl = user?.user_metadata?.avatar_url;

    useEffect(() => {
        const fetchLanguages = async () => {
            const languages = await getActiveLanguages();
            const reorderedLanguages = reorderActiveLanguages(
                languages,
                translations["language"]
            );
            setActiveLanguages(reorderedLanguages);
        };
        fetchLanguages();
    }, [translations["language"]]);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar navbar-expand-lg ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <a className="navbar-brand d-flex align-items-center" href="/">
                    <div>
                        <strong>
                            Voc
                            <span className="brand-highlight">ability</span>
                        </strong>
                    </div>
                </a>

                {/* Search Bar on Mobile/Desktop */}
                {languageCode && onQuickAddWord && (
                    <div className="d-none d-lg-block ms-4" style={{ width: "300px" }}>
                        <QuickSearchBar onAddWord={onQuickAddWord} languageCode={languageCode} />
                    </div>
                )}

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
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <a
                                            className="dropdown-item d-flex align-items-center"
                                            href={`/${translations["language"]}/favorite`}
                                        >
                                            <div
                                                className="collection-icon"
                                                style={{
                                                    color: "#FFC000",
                                                }}
                                            >
                                                <i className="fas fa-star"></i>
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

                            <li className="nav-item mx-2">
                                <a
                                    className="nav-link active"
                                    href={`/${translations["language"]}/practices`}
                                >
                                    {translations["navbar.practices"]}
                                </a>
                            </li>

                            {/* Language Selector */}
                            {languageCode && (
                                <li
                                    className={`nav-item mx-2 ${activeLanguages.length > 0
                                        ? "dropdown"
                                        : ""
                                        }`}
                                    style={{ cursor: "pointer" }}
                                >
                                    <a
                                        className="nav-link active language-selector"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <span
                                            className={`fi fi-${languageCode} language-flag`}
                                        ></span>
                                        <span className="language-code">
                                            {languageCode !== "us"
                                                ? languageCode
                                                : "en"}
                                        </span>
                                    </a>
                                    {activeLanguages &&
                                        activeLanguages.length > 0 && (
                                            <ul className="dropdown-menu">
                                                {activeLanguages.map(
                                                    (language: any) => (
                                                        <li key={language.id}>
                                                            <a
                                                                className={`dropdown-item d-flex ${language.code ===
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

                            {/* User Avatar Dropdown */}
                            <li className="nav-item dropdown ms-2">
                                <a
                                    className="nav-link p-0 d-flex align-items-center"
                                    href="#"
                                    id="userDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <div className="avatar-wrapper">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="User Avatar"
                                                className="user-avatar"
                                            />
                                        ) : (
                                            <div className="user-avatar-placeholder">
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                    </div>
                                </a>
                                <ul
                                    className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2"
                                    aria-labelledby="userDropdown"
                                >
                                    <li className="px-3 py-2 border-bottom mb-1">
                                        <div className="small text-muted">{translations["navbar.signedInAs"]}</div>
                                        <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
                                            {displayName}
                                        </div>
                                    </li>
                                    <li>
                                        <a className="dropdown-item d-flex align-items-center py-2" href="/profile">
                                            <i className="fas fa-user-circle me-2"></i>
                                            Profile
                                        </a>
                                    </li>
                                    <li><hr className="dropdown-divider-custom my-1" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }} /></li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger d-flex align-items-center py-2"
                                            onClick={() => signOut()}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            {translations["navbar.signOut"]}
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div
                        className="collapse navbar-collapse justify-content-end"
                        id="navbar-toggle"
                    >
                        <ul className="navbar-nav mb-2 mb-lg-0 align-items-center">
                            <li className="nav-item ms-lg-3">
                                <div className="navbar-greeting">
                                    Hi {displayName}! 👋
                                </div>
                            </li>
                            {/* User Avatar Dropdown for Root view */}
                            <li className="nav-item dropdown ms-2">
                                <a
                                    className="nav-link p-0 d-flex align-items-center"
                                    href="#"
                                    id="userDropdownRoot"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <div className="avatar-wrapper">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="User Avatar"
                                                className="user-avatar"
                                            />
                                        ) : (
                                            <div className="user-avatar-placeholder">
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                    </div>
                                </a>
                                <ul
                                    className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2"
                                    aria-labelledby="userDropdownRoot"
                                >
                                    <li className="px-3 py-2 border-bottom mb-1">
                                        <div className="small text-muted">Signed in as</div>
                                        <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
                                            {displayName}
                                        </div>
                                    </li>
                                    <li>
                                        <a className="dropdown-item d-flex align-items-center py-2" href="/profile">
                                            <i className="fas fa-user-circle me-2"></i>
                                            Profile
                                        </a>
                                    </li>
                                    <li><hr className="dropdown-divider-custom my-1" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }} /></li>
                                    <li>
                                        <button
                                            className="dropdown-item text-danger d-flex align-items-center py-2"
                                            onClick={() => signOut()}
                                        >
                                            <i className="fas fa-sign-out-alt me-2"></i>
                                            Sign out
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
};
