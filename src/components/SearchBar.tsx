import React, { useEffect, useState } from "react";
import { Collection, Word, WordDto } from "../interfaces/model";
import { FilterSortingOption } from "../interfaces/mainProps";
import { SortFilter } from "./Filter/SortFilter";
import { CollectionFilter } from "./Filter/CollectionFilter";
import { useLanguage } from "../LanguageContext";
import "../styles/SearchBar.css";

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
    isHideDefinition?: boolean;
    onToggleHideDefinition?: () => void;
    viewMode?: 'grid' | 'list';
    setViewMode?: React.Dispatch<React.SetStateAction<'grid' | 'list'>>;
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
        isHideDefinition,
        onToggleHideDefinition,
        viewMode,
        setViewMode,
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
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        className="search-input"
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
                </div>

                <div className="search-bar-actions">
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

                            {type === "collection" && setViewMode && (
                                <div className="dropdown">
                                    <button
                                        className="btn-view-mode"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className={`fas ${viewMode === 'grid' ? 'fa-th-large' : 'fa-list'}`}></i>
                                        <i className="fas fa-chevron-down"></i>
                                    </button>
                                    <ul className="dropdown-menu filter-dropdown-menu">
                                        <li onClick={() => setViewMode('grid')}>
                                            <a className={`dropdown-item ${viewMode === 'grid' ? 'active' : ''}`}>
                                                <i className="fas fa-th-large me-2"></i>
                                                {translations["searchBar.gridView"]}
                                            </a>
                                        </li>
                                        <li onClick={() => setViewMode('list')}>
                                            <a className={`dropdown-item ${viewMode === 'list' ? 'active' : ''}`}>
                                                <i className="fas fa-list me-2"></i>
                                                {translations["searchBar.listView"]}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {type === "collection" && (
                                <button
                                    className="action-button btn-create-collection"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add-collection"
                                >
                                    <i className="fas fa-plus"></i>
                                    {translations["collectionPage.createCollectionBtn"]}
                                </button>
                            )}

                            {onToggleHideDefinition && (
                                <button
                                    className={`btn-search-utility icon-only ${isHideDefinition ? 'active' : ''}`}
                                    type="button"
                                    onClick={onToggleHideDefinition}
                                    title={isHideDefinition ? translations["showDefinition"] : translations["hideDefinition"]}
                                >
                                    <i className={`fas ${isHideDefinition ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                </button>
                            )}

                            <button
                                className="action-button btn-add-word"
                                type="button"
                                data-bs-toggle="modal"
                                data-bs-target="#add-word"
                            >
                                <i className="fas fa-plus-circle"></i>
                                {translations["addWordForm.addWordBtn"]}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }
);
