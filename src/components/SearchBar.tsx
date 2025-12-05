import React, { useEffect, useState } from "react";
import { Collection, Word, WordDto } from "../interfaces/model";
import { FilterSortingOption } from "../interfaces/mainProps";
import { SortFilter } from "./Filter/SortFilter";
import { CollectionFilter } from "./Filter/CollectionFilter";
import { useLanguage } from "../LanguageContext";

export const SearchBar: React.FC<{
    isFavorite: boolean;
    type: "word" | "collection";
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
    setFilteredCollections?: React.Dispatch<React.SetStateAction<Collection[]>>;
}> = React.memo(
    ({
        isFavorite,
        type,
        collections,
        selectedCollection,
        filterSorting,
        filteredWords,
        words,
        handleFilter,
        setFilterSorting,
        setFilteredWords,
        setDisplayWordDtos,
        setFilteredCollections,
    }) => {
        const [searchValue, setSearchValue] = useState<string>("");
        const [displayWords, setDisplayWords] = useState<Word[]>([]); // for SortFilter component
        const [displayCollections, setDisplayCollections] = useState<
            Collection[]
        >([]); // for SortFilter component

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
                : type === "word"
                    ? useEffect(() => {
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
                    }, [searchValue, words])
                    : useEffect(() => {
                        // Search for collections
                        const lowerCaseSearchValue = searchValue
                            .toLowerCase()
                            .trim();
                        const filtered =
                            collections &&
                            collections.filter((collection) =>
                                collection.name
                                    .toLowerCase()
                                    .includes(lowerCaseSearchValue)
                            );
                        setDisplayCollections &&
                            filtered &&
                            setDisplayCollections(filtered);
                        setFilteredCollections &&
                            filtered &&
                            setFilteredCollections(filtered);
                    }, [searchValue, collections]);
        }

        return (
            <div className="input-group d-flex justify-content-center my-4">
                <input
                    className="form-control"
                    type="search"
                    placeholder={
                        type === "collection"
                            ? translations["searchBar.placeholderCollection"]
                            : translations["searchBar.placeholder"]
                    }
                    aria-label={
                        type === "collection"
                            ? translations["searchBar.placeholderCollection"]
                            : translations["searchBar.placeholder"]
                    }
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
                    <>
                        <SortFilter
                            displayWords={displayWords}
                            displayCollections={displayCollections}
                            filterSorting={filterSorting}
                            setFilterSorting={setFilterSorting}
                            setFilteredWords={setFilteredWords}
                            setFilteredCollections={setFilteredCollections}
                        />

                        {/* {type === "collection" && (
                            <button
                                className="btn btn-outline-success"
                                data-bs-toggle="modal"
                                data-bs-target="#add-collection"
                                style={{
                                    borderRadius: "0.25rem",
                                    marginRight: "8px",
                                }}
                            >
                                Create collection
                            </button>
                        )} */}

                        <button
                            className="btn"
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#add-word"
                            style={{
                                borderRadius: "0.25rem",
                                backgroundColor: "rgb(221, 87, 70)",
                                color: "#fff",
                            }}
                        >
                            {translations["addWordForm.addWordBtn"]}
                        </button>
                    </>
                )}
            </div>
        );
    }
);
