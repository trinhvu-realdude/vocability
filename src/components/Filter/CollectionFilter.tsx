import { Collection } from "../../interfaces/model";
import { CollectionFilterProps } from "../../interfaces/props";

export const CollectionFilter: React.FC<CollectionFilterProps> = ({
    selectedCollection,
    collections,
    handleFilter,
}) => {
    // const handleFilter = async (collection: Collection) => {
    //     setSelectedCollection(collection);
    //     const words = favoriteWords.filter(
    //         (word) => word.collection.id === collection.id
    //     );
    //     setFilteredWords(words);
    // };
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
                    "All collections"
                )}
            </button>
            <ul className="dropdown-menu">
                <li
                    style={{ cursor: "default" }}
                    // onClick={() => {
                    //     setSelectedCollection(undefined);
                    //     setFilteredWords(favoriteWords);
                    // }}
                    onClick={() => handleFilter(null)}
                >
                    <a className="dropdown-item">All collections</a>
                </li>
                {collections.map((collection, index) => (
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
