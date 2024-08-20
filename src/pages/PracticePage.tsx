import { practices } from "../utils/constants";

export const PracticePage = () => {
    return (
        <div className="container-list" id="practices-list">
            <h4 className="text-center my-4">Practices</h4>
            <div className="row">
                {practices.map((practice, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                        <div className="card" id="card-practice">
                            <a
                                href={practice.href}
                                className="card-body text-center"
                            >
                                <strong>{practice.name}</strong>
                                <p className="mt-4">{practice.description}</p>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
