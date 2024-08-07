import { useEffect, useState } from "react";
import { FilterSortingOption, SearchBarProps } from "../interfaces/props";
import { filterSortingOptions } from "../utils/constants";
import { sortWordsByFilter } from "../utils/helper";

export const SearchBar: React.FC<SearchBarProps> = ({
    words,
    displayWords,
    filterSorting,
    setDisplayWords,
    setFilteredWords,
    setFilterSorting,
}) => {
    const [searchValue, setSearchValue] = useState<string>("");

    const handleFilter = async (filter: FilterSortingOption) => {
        setFilterSorting(filter);
        const sortedWords = sortWordsByFilter(displayWords, filter.value);
        setFilteredWords(sortedWords);
    };

    useEffect(() => {
        const lowerCaseSearchValue = searchValue.toLowerCase().trim();
        const filtered = words.filter((word) =>
            word.word.toLowerCase().includes(lowerCaseSearchValue)
        );
        setDisplayWords(filtered);
        setFilteredWords(filtered);
    }, [searchValue, words]);

    return (
        <div className="input-group d-flex justify-content-center mt-4">
            <input
                className="form-control"
                type="search"
                placeholder="Search word in collection"
                aria-label="Search word in collection"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
            />

            <button
                className="btn"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                    border: "1px solid #ced4da",
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
        </div>
    );
};
