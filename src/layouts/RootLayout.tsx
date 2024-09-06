import { StorageBar } from "../components/StorageBar";

const RootLayout = () => {
    return (
        <div className="container my-4">
            <StorageBar />
            <section id="hero" className="text-center my-5">
                <h2>
                    Welcome to{" "}
                    <strong>
                        Voc
                        <span style={{ color: "#DD5746" }}>ability</span>
                    </strong>
                </h2>
                <p>
                    🚀 Master vocabulary with interactive practices and
                    customized collections.
                </p>
                <a href="/collections" className="btn btn-outline-primary">
                    Get Started
                </a>
            </section>

            <section id="features" className="my-5">
                <div className="row text-center">
                    <div className="col-md-3">
                        <i className="fas fa-layer-group fa-3x mb-3"></i>
                        <h4>Collections</h4>
                        <p>
                            Organize your vocabulary into personalized
                            collections.
                        </p>
                    </div>
                    <div className="col-md-3">
                        <i className="fas fa-tasks fa-3x mb-3"></i>
                        <h4>Practices</h4>
                        <p>
                            Test your skills with interactive vocabulary games
                            and quizzes.
                        </p>
                    </div>
                    <div className="col-md-3">
                        <i className="fas fa-file-export fa-3x mb-3"></i>
                        <h4>Export</h4>
                        <p>
                            Easily export your collections and results for
                            future use.
                        </p>
                    </div>
                    <div className="col-md-3">
                        <i className="fas fa-book fa-3x mb-3"></i>
                        <h4>Glossary</h4>
                        <p>Access a comprehensive glossary of terms.</p>
                    </div>
                </div>
            </section>

            <footer className="text-center mt-5">
                <p>&copy; 2024 Vocability | Contact us: info@vocability.com</p>
                <div className="container d-flex justify-content-between algin-items-center" style={{width: "20%"}}>
                    <a href="#">
                        <i className="fab fa-facebook"></i>
                    </a>
                    <a href="#">
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a href="#">
                        <i className="fab fa-instagram"></i>
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default RootLayout;
