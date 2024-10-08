import React, { useEffect, useState } from "react";
import { Collection, Word, WordDto } from "../interfaces/model";
import { FilterSortingOption } from "../interfaces/mainProps";
import { SortFilter } from "./Filter/SortFilter";
import { CollectionFilter } from "./Filter/CollectionFilter";
import { useLanguage } from "../LanguageContext";

export const SearchBar: React.FC<{
    isFavorite: boolean;
    collections?: Collection[];
    selectedCollection?: Collection | undefined;
    filterSorting?: FilterSortingOption | undefined;
    filteredWords?: WordDto[];
    words?: Word[];
    handleFilter?: (collection: Collection | null) => void;
    setDisplayWordDtos?: React.Dispatch<React.SetStateAction<WordDto[]>>;
    setFilteredWords?: React.Dispatch<React.SetStateAction<Word[]>>;
    setFilterSorting?: React.Dispatch<
        React.SetStateAction<FilterSortingOption | undefined>
    >;
}> = React.memo(
    ({
        isFavorite,
        collections,
        selectedCollection,
        filterSorting,
        filteredWords,
        words,
        handleFilter,
        setFilterSorting,
        setFilteredWords,
        setDisplayWordDtos,
    }) => {
        const [searchValue, setSearchValue] = useState<string>("");
        const [displayWords, setDisplayWords] = useState<Word[]>([]); // for SortFilter component

        const { translations } = useLanguage();

        {
            isFavorite
                ? useEffect(() => {
                      // Search for Favorite collection
                      const lowerCaseSearchValue = searchValue
                          .toLowerCase()
                          .trim();
                      const filtered =
                          filteredWords &&
                          filteredWords.filter((word) =>
                              word.word
                                  .toLowerCase()
                                  .includes(lowerCaseSearchValue)
                          );
                      setDisplayWordDtos &&
                          filtered &&
                          setDisplayWordDtos(filtered);
                  }, [searchValue, filteredWords])
                : useEffect(() => {
                      // Search for main collections
                      const lowerCaseSearchValue = searchValue
                          .toLowerCase()
                          .trim();
                      const filtered =
                          words &&
                          words.filter((word) =>
                              word.word
                                  .toLowerCase()
                                  .includes(lowerCaseSearchValue)
                          );
                      setDisplayWords && filtered && setDisplayWords(filtered);
                      setFilteredWords &&
                          filtered &&
                          setFilteredWords(filtered);
                  }, [searchValue, words]);
        }

        return (
            <div className="input-group d-flex justify-content-center mt-4">
                <input
                    className="form-control"
                    type="search"
                    placeholder={translations["searchBar.placeholder"]}
                    aria-label={translations["searchBar.placeholder"]}
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
    }
);
