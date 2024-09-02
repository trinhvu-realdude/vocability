export const PracticeMessage: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="text-center px-4">
            <p>{message}</p>
        </div>
    );
};
