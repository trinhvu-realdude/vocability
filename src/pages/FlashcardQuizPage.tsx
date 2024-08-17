import { NoDataMessage } from "../components/NoDataMessage";
import { FlashcardQuizPageProps } from "../interfaces/practiceProps";

export const FlashcardQuizPage: React.FC<FlashcardQuizPageProps> = ({
    collections,
}) => {
    return (
        <div className="container-list" id="flashcard-quiz">
            <h4 className="text-center mt-4">Flashcard Quiz</h4>

            {collections && collections.length > 0 ? (
                <div className="input-group mb-2">
                    <select
                        className="form-select"
                        id="part-of-speech"
                        // onChange={(event) => setPartOfSpeech(event.target.value)}
                    >
                        <option value="">Collection</option>
                        {collections.map((collection, index) => (
                            <option key={index} value={collection.name}>
                                {collection.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        className="form-control"
                        placeholder="Number of cards"
                        min={1}
                        // onChange={(event) => setWord(event.target.value)}
                    />
                    <button className="btn btn-outline-success">
                        Generate
                    </button>
                </div>
            ) : (
                <NoDataMessage message="&#128511; You have no collection. Let's start to take note and practice vocabulary." />
            )}
        </div>
    );
};
