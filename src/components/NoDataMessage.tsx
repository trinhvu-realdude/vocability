import { NoDataMessageProps } from "../interfaces/mainProps";

export const NoDataMessage: React.FC<NoDataMessageProps> = ({ message }) => {
    return (
        <div className="text-center px-4">
            <p>{message}</p>
        </div>
    );
};
