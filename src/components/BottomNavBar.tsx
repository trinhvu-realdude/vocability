import React from 'react';
import { useLanguage } from '../LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/BottomNavBar.css';

interface BottomNavBarProps {
    onAddWordClick?: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onAddWordClick }) => {
    const { translations } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const lang = translations["language"] || "en";

    const navItems = [
        { path: `/${lang}/collections`, icon: 'fas fa-folder', label: translations["navbar.collections"] || "Collections" },
        { path: `/${lang}/practices`, icon: 'fas fa-brain', label: translations["navbar.practices"] || "Practice" },
        // The center button is a special case
        { path: `/${lang}/favorite`, icon: 'fas fa-star', label: translations["navbar.collections.favorite"] || "Favorite" },
        { path: `/profile`, icon: 'fas fa-user', label: translations["navbar.profile"] || "Profile" },
    ];

    const isActive = (path: string) => {
        // Precise active matching to prevent both highlighting on root
        if (path === `/profile` && location.pathname.includes('/profile')) return true;
        if (path !== `/profile` && location.pathname.includes(path)) return true;
        return false;
    };

    return (
        <div className="bottom-nav-bar d-lg-none">
            {navItems.slice(0, 2).map((item, idx) => (
                <div 
                    key={idx} 
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                </div>
            ))}

            {/* Central Add Button */}
            <div 
                className="nav-item center-add-btn" 
                onClick={onAddWordClick}
                data-bs-toggle="modal"
                data-bs-target="#global-add-word"
            >
                <div className="add-btn-circle">
                    <i className="fas fa-plus"></i>
                </div>
            </div>

            {navItems.slice(2, 4).map((item, idx) => (
                <div 
                    key={idx + 2} 
                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};
