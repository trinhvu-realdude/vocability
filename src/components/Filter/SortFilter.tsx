import { FilterSortingOption, SortFilterProps } from "../../interfaces/mainProps";
import { filterSortingOptions } from "../../utils/constants";
import { sortWordsByFilter } from "../../utils/helper";

export const SortFilter: React.FC<SortFilterProps> = ({
    filterSorting,
    displayWords,
    setFilterSorting,
    setFilteredWords,
}) => {
    const handleFilter = async (filter: FilterSortingOption) => {
        if (displayWords && setFilterSorting && setFilteredWords) {
            setFilterSorting(filter);
            const sortedWords = sortWordsByFilter(displayWords, filter.value);
            setFilteredWords(sortedWords);
        }
    };

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
                {filterSorting ? filterSorting.label : "Sort by"} &#8645;
            </button>
            <ul className="dropdown-menu">
                {filterSortingOptions.map((filter, index) => (
                    <li
                        key={index}
                        onClick={() => handleFilter(filter)}
                        style={{ cursor: "default" }}
                    >
                        <a className="dropdown-item">{filter.label}</a>
                    </li>
                ))}
            </ul>
        </>
    );
};
