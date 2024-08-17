import { NoDataMessageProps } from "../interfaces/mainProps";

export const NoDataMessage: React.FC<NoDataMessageProps> = ({
    collectionName,
    collectionColor,
    message,
}) => {
    return (
        <div className="text-center">
            {collectionColor && collectionName ? (
                <p>
                    &#128531; No found word in{" "}
                    <span style={{ color: collectionColor }}>
                        {collectionName}
                    </span>{" "}
                    collection
                </p>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
};
