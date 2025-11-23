import { CommonProps, FilterSortingOption } from "../interfaces/mainProps";
import "../App.css";
import { CollectionCard } from "../components/Card/CollectionCard";
import { NoDataMessage } from "../components/NoDataMessage";
import { APP_NAME } from "../utils/constants";
import { CreateCollectionModal } from "../components/Modal/CreateCollectionModal";
import { useLanguage } from "../LanguageContext";
import { SearchBar } from "../components/SearchBar";
import { Collection } from "../interfaces/model";
import { useState } from "react";

export const CollectionPage: React.FC<CommonProps> = ({
    db,
    collections,
    setCollections,
}) => {
    const { translations } = useLanguage();
    const [filteredCollections, setFilteredCollections] =
        useState<Collection[]>(collections);
    const [filterSorting, setFilterSorting] = useState<FilterSortingOption>();

    document.title = `${translations["flag"]} ${APP_NAME} | All collections`;

    return (
        <div className="container-list" id="collection-list">
            <h4 className="text-center my-4">
                {translations["collectionPage.title"]}
            </h4>
            <SearchBar
                isFavorite={false}
                type="collection"
                collections={collections}
                filterSorting={filterSorting}
                setFilterSorting={setFilterSorting}
                setFilteredCollections={setFilteredCollections}
            />
            {/* <div className="text-center">
                <button
                    className="btn btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#add-collection"
                    style={{
                        borderRadius: "0.25rem",
                        marginRight: "8px",
                    }}
                >
                    <strong>&#x2B;</strong>{" "}
                </button>
            </div> */}
            <div className="row mt-4 mb-2">
                {filteredCollections && filteredCollections.length > 0 ? (
                    filteredCollections.map((collection) => (
                        <CollectionCard
                            key={collection.id}
                            db={db}
                            collection={collection}
                            setCollections={setCollections}
                            languageCode={translations["language"]}
                        />
                    ))
                ) : (
                    <NoDataMessage
                        message={`${translations["collectionPage.noDataMessage"]}`}
                    />
                )}
            </div>
            <CreateCollectionModal db={db} setCollections={setCollections} />
        </div>
    );
};
