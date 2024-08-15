import { SearchBarProps } from "../interfaces/props";

export const SearchBar: React.FC<SearchBarProps> = ({
    searchValue,
    setSearchValue,
}) => {
    return (
        <input
            className="form-control"
            type="search"
            placeholder="Search word in collection"
            aria-label="Search word in collection"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
        />
    );
};
