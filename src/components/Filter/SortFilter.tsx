import {
    FilterSortingOption,
    SortFilterProps,
} from "../../interfaces/mainProps";
import { useLanguage } from "../../LanguageContext";
import { filterSortingOptions } from "../../utils/constants";
import { sortCollectionsByFilter, sortWordsByFilter } from "../../utils/helper";
import "../../styles/SearchBar.css";

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
        <div className="dropdown">
            <button
                className="filter-button"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                {filterSorting
                    ? filterSorting.label
                    : translations["searchBar.sortBy"]}
                <i className="fas fa-sort filter-icon"></i>
            </button>
            <ul className="dropdown-menu filter-dropdown-menu">
                {selectedFilterSortingOptions &&
                    selectedFilterSortingOptions["list"].map(
                        (filter, index) => (
                            <li
                                key={index}
                                onClick={() => handleFilter(filter)}
                            >
                                <a
                                    className={`dropdown-item ${filterSorting?.value === filter.value ? 'active' : ''}`}
                                >
                                    {filter.label}
                                </a>
                            </li>
                        )
                    )}
            </ul>
        </div>
    );
};
