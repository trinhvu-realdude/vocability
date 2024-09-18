import { CollectionFilterProps } from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";

export const CollectionFilter: React.FC<CollectionFilterProps> = ({
    selectedCollection,
    collections,
    handleFilter,
}) => {
    const { translations } = useLanguage();

    return (
        <>
            <button
                className="btn"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                    border: "1px solid #ced4da",
                    borderTopRightRadius: "0.25rem",
                    borderBottomRightRadius: "0.25rem",
                }}
            >
                {selectedCollection ? (
                    <span style={{ color: selectedCollection.color }}>
                        <strong>{selectedCollection.name}</strong>
                    </span>
                ) : (
                    translations["searchBar.allCollections"]
                )}
            </button>
            <ul className="dropdown-menu">
                <li
                    style={{ cursor: "default" }}
                    onClick={() => handleFilter && handleFilter(null)}
                >
                    <a className="dropdown-item">
                        {translations["searchBar.allCollections"]}
                    </a>
                </li>
                {collections &&
                    handleFilter &&
                    collections.map((collection, index) => (
                        <li
                            key={index}
                            style={{ cursor: "default" }}
                            onClick={() => handleFilter(collection)}
                        >
                            <a className="dropdown-item d-flex">
                                <span style={{ color: collection.color }}>
                                    <strong>{collection.name}</strong>
                                </span>
                            </a>
                        </li>
                    ))}
            </ul>
        </>
    );
};
