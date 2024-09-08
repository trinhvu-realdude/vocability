import { StorageBar } from "../components/StorageBar";
import { HomePage } from "../pages/HomePage";

const RootLayout = () => {
    return (
        <div className="container my-4">
            <StorageBar />
            <HomePage/>
        </div>
    );
};

export default RootLayout;
