import { PageHeader } from "../components/PageHeader";
import { glossaryItems } from "../utils/constants";

export const GlossaryPage = () => {
    return (
        <div id="glossary" className="container-list">
            <PageHeader
                href={document.referrer}
                content={<span style={{ color: "#DD5746" }}>Glossary</span>}
            />
            <div className="list-group">
                {glossaryItems.map((item, index) => (
                    <div key={index} className="col-md-6 mb-4 w-100">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">
                                    <strong>{item.title}</strong>
                                </h5>
                                <p className="card-text">{item.definition}</p>
                                <p className="card-text">
                                    <small className="text-muted">
                                        {item.example}
                                    </small>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
