import { CommonProps } from "../interfaces/mainProps";
import "../App.css";
import { CollectionCard } from "../components/Card/CollectionCard";
import { NoDataMessage } from "../components/NoDataMessage";

export const CollectionPage: React.FC<CommonProps> = ({
    db,
    collections,
    setCollections,
}) => {
    return (
        <div className="container-list" id="collection-list">
            <h4 className="text-center mt-4">Collections</h4>
            <div className="row">
                {collections && collections.length > 0 ? (
                    collections.map((collection) => (
                        <CollectionCard
                            key={collection.id}
                            db={db}
                            collection={collection}
                            setCollections={setCollections}
                        />
                    ))
                ) : (
                    <NoDataMessage
                        message="&#128511; Oops...! You have no collection.
                        Let's start to take note and practice vocabulary."
                    />
                )}
            </div>
        </div>
    );
};
