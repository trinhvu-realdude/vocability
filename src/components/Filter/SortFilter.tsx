import {
    FilterSortingOption,
    SortFilterProps,
} from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";
import { filterSortingOptions } from "../../utils/constants";
import { sortCollectionsByFilter, sortWordsByFilter } from "../../utils/helper";

export const SortFilter: React.FC<SortFilterProps> = ({
    filterSorting,
    displayWords,
    displayCollections,
    setFilterSorting,
    setFilteredWords,
    setFilteredCollections
}) => {
    const { translations } = useLanguage();

    const handleFilter = async (filter: FilterSortingOption) => {
        if (displayWords && setFilterSorting && setFilteredWords) {
            setFilterSorting(filter);
            const sortedWords = sortWordsByFilter(displayWords, filter.value);
            setFilteredWords(sortedWords);
        }
        console.log(filter, displayCollections, setFilterSorting, setFilteredCollections);
        
        if (displayCollections && setFilteredCollections && setFilterSorting) {
            setFilterSorting(filter);
            const sortedCollections = sortCollectionsByFilter(displayCollections, filter.value);
            setFilteredCollections(sortedCollections);
        }
    };

    const selectedFilterSortingOptions = filterSortingOptions.find(
        (language) => language.code === translations["language"]
    );

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
                    marginRight: "8px",
                }}
            >
                {filterSorting
                    ? filterSorting.label
                    : translations["searchBar.sortBy"]}{" "}
                &#8645;
            </button>
            <ul className="dropdown-menu">
                {selectedFilterSortingOptions &&
                    selectedFilterSortingOptions["list"].map(
                        (filter, index) => (
                            <li
                                key={index}
                                onClick={() => handleFilter(filter)}
                                style={{ cursor: "default" }}
                            >
                                <a className="dropdown-item">{filter.label}</a>
                            </li>
                        )
                    )}
            </ul>
        </>
    );
};
