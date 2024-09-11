import { CommonProps } from "../interfaces/mainProps";
import "../App.css";
import { CollectionCard } from "../components/Card/CollectionCard";
import { NoDataMessage } from "../components/NoDataMessage";
import { APP_NAME } from "../utils/constants";
import { CreateCollectionModal } from "../components/Modal/CreateCollectionModal";
import { useLanguage } from "../LanguageContext";

export const CollectionPage: React.FC<CommonProps> = ({
    db,
    collections,
    setCollections,
}) => {
    document.title = `${APP_NAME} | All collections`;

    const { translations } = useLanguage();

    return (
        <div className="container-list" id="collection-list">
            <h4 className="text-center my-4">
                {translations["collectionPage.title"]}
            </h4>
            <div className="row mb-2">
                {collections && collections.length > 0 ? (
                    collections.map((collection) => (
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
            <div className="text-center">
                <button
                    className="btn btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#add-collection"
                >
                    <strong>&#x2B;</strong>{" "}
                    {translations["collectionPage.createCollectionBtn"]}
                </button>
            </div>
            <CreateCollectionModal db={db} setCollections={setCollections} />
        </div>
    );
};
