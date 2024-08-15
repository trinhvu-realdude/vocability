import React from "react";
import { Collection, Word } from "../interfaces/model";
import { FilterSortingOption } from "../interfaces/props";
import { SortFilter } from "./Filter/SortFilter";
import { CollectionFilter } from "./Filter/CollectionFilter";

export const SearchBar: React.FC<{
    isFavorite: boolean;
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    collections?: Collection[];
    selectedCollection?: Collection | undefined;
    handleFilter?: (collection: Collection | null) => void;
    displayWords?: Word[];
    filterSorting?: FilterSortingOption | undefined;
    setFilterSorting?: React.Dispatch<
        React.SetStateAction<FilterSortingOption | undefined>
    >;
    setFilteredWords?: React.Dispatch<React.SetStateAction<Word[]>>;
}> = ({
    isFavorite,
    searchValue,
    setSearchValue,
    collections,
    selectedCollection,
    handleFilter,
    displayWords,
    filterSorting,
    setFilterSorting,
    setFilteredWords,
}) => {
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
            {isFavorite ? (
                <CollectionFilter
                    collections={collections}
                    selectedCollection={selectedCollection}
                    handleFilter={handleFilter}
                />
            ) : (
                <SortFilter
                    displayWords={displayWords}
                    filterSorting={filterSorting}
                    setFilterSorting={setFilterSorting}
                    setFilteredWords={setFilteredWords}
                />
            )}
        </div>
    );
};
