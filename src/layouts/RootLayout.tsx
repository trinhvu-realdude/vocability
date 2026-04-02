import { StorageBar } from "../components/StorageBar";
import { HomePage } from "../pages/HomePage";
import { useAuth } from "../contexts/AuthContext";

const RootLayout: React.FC = () => {
    const { activeLanguages, loading } = useAuth();

    return (
        <div className="container my-4">
            <StorageBar />
            <HomePage activeLanguages={activeLanguages} isLoading={loading} />
        </div>
    );
};

export default RootLayout;
