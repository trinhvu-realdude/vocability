import { IDBPDatabase } from "idb";
import { Collection, MyDB } from "../../interfaces/model";
import { getRandomColor } from "../../utils/helper";
import { useState } from "react";
import {
    addCollection,
    getCollections,
} from "../../services/CollectionService";

export const CreateCollectionModal: React.FC<{
    db: IDBPDatabase<MyDB> | undefined;
    setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
}> = ({ db, setCollections }) => {
    const [randomColor, setRandomColor] = useState<string>(getRandomColor());
    const [color, setColor] = useState<string>("");
    const [name, setName] = useState<string>("");

    const handleAddCollection = async () => {
        try {
            if (db) {
                const objCollection = {
                    name: name,
                    color: color || randomColor,
                    createdAt: new Date(),
                } as Collection;
                await addCollection(db, objCollection);

                const storedCollections = await getCollections(db);
                setCollections(storedCollections);
                reset();
            }
        } catch (error) {
            console.log(error);
            alert("Failed to add collection");
        }
    };

    const reset = () => {
        setColor("");
        setName("");
        setRandomColor(getRandomColor());
    };

    return (
        <div
            className="modal fade"
            id="add-collection"
            tabIndex={-1}
            aria-labelledby="#add-collection"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-sm">
                <div className="modal-content">
                    <div
                        className="modal-header"
                        style={{
                            backgroundColor: color !== "" ? color : randomColor,
                            color: "#fff",
                        }}
                    >
                        <h5 className="modal-title" id="add-collection">
                            Create collection
                        </h5>
                        <button
                            type="button"
                            className="btn btn-sm"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            style={{ border: "none", color: "#fff" }}
                            onClick={reset}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="modal-body text-center">
                        <div className="input-group mb-2">
                            <input
                                type="color"
                                className="form-control form-control-color"
                                id="color-input"
                                value={color !== "" ? color : randomColor}
                                title="Choose your color"
                                onChange={(event) =>
                                    setColor(event.target.value)
                                }
                            />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Name"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-bs-dismiss="modal"
                            onClick={reset}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={handleAddCollection}
                            data-bs-dismiss="modal"
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
