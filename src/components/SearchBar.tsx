import React, { useEffect, useState } from "react";
import { Collection, Word, WordDto } from "../interfaces/model";
import { FilterSortingOption } from "../interfaces/props";
import { SortFilter } from "./Filter/SortFilter";
import { CollectionFilter } from "./Filter/CollectionFilter";

export const SearchBar: React.FC<{
    isFavorite: boolean;
    collections?: Collection[];
    selectedCollection?: Collection | undefined;
    displayWords?: Word[];
    filterSorting?: FilterSortingOption | undefined;
    filteredWords?: WordDto[];
    words?: Word[];
    handleFilter?: (collection: Collection | null) => void;
    setDisplayWordDtos?: React.Dispatch<React.SetStateAction<WordDto[]>>;
    setDisplayWords?: React.Dispatch<React.SetStateAction<Word[]>>;
    setFilteredWords?: React.Dispatch<React.SetStateAction<Word[]>>;
    setFilterSorting?: React.Dispatch<
        React.SetStateAction<FilterSortingOption | undefined>
    >;
}> = ({
    isFavorite,
    collections,
    selectedCollection,
    displayWords,
    filterSorting,
    filteredWords,
    words,
    handleFilter,
    setFilterSorting,
    setFilteredWords,
    setDisplayWordDtos,
    setDisplayWords,
}) => {
    const [searchValue, setSearchValue] = useState<string>("");

    {
        isFavorite
            ? useEffect(() => {
                  // Search for Favorite collection
                  const lowerCaseSearchValue = searchValue.toLowerCase().trim();
                  const filtered =
                      filteredWords &&
                      filteredWords.filter((word) =>
                          word.word.toLowerCase().includes(lowerCaseSearchValue)
                      );
                  setDisplayWordDtos &&
                      filtered &&
                      setDisplayWordDtos(filtered);
              }, [searchValue, filteredWords])
            : useEffect(() => {
                  // Search for main collections
                  const lowerCaseSearchValue = searchValue.toLowerCase().trim();
                  const filtered =
                      words &&
                      words.filter((word) =>
                          word.word.toLowerCase().includes(lowerCaseSearchValue)
                      );
                  setDisplayWords && filtered && setDisplayWords(filtered);
                  setFilteredWords && filtered && setFilteredWords(filtered);
              }, [searchValue, words]);
    }

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
