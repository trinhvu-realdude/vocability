import { CollectionFilterProps } from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";
import "../../styles/SearchBar.css";

export const CollectionFilter: React.FC<CollectionFilterProps> = ({
    selectedCollection,
    collections,
    handleFilter,
}) => {
    const { translations } = useLanguage();

    return (
        <div className="dropdown">
            <button
                className="filter-button"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {selectedCollection ? (
                    <span
                        className="collection-filter-badge"
                        style={{
                            background: `${selectedCollection.color}20`,
                            color: selectedCollection.color
                        }}
                    >
                        <i className="fas fa-layer-group"></i>
                        {selectedCollection.name}
                    </span>
                ) : (
                    <>
                        <i className="fas fa-filter"></i>
                        {translations["searchBar.allCollections"]}
                    </>
                )}
            </button>
            <ul className="dropdown-menu filter-dropdown-menu">
                <li
                    onClick={() => handleFilter && handleFilter(null)}
                >
                    <a className={`dropdown-item ${!selectedCollection ? 'active' : ''}`}>
                        <i className="fas fa-th-large" style={{ marginRight: '0.5rem', color: '#6c757d' }}></i>
                        {translations["searchBar.allCollections"]}
                    </a>
                </li>
                {collections &&
                    handleFilter &&
                    collections.map((collection, index) => (
                        <li
                            key={index}
                            onClick={() => handleFilter(collection)}
                        >
                            <a className={`dropdown-item ${selectedCollection?.id === collection.id ? 'active' : ''}`}>
                                <i
                                    className="fas fa-layer-group"
                                    style={{
                                        marginRight: '0.5rem',
                                        color: collection.color
                                    }}
                                ></i>
                                {collection.name}
                            </a>
                        </li>
                    ))}
            </ul>
        </div>
    );
};
