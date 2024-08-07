import { Route, Routes } from "react-router-dom";
import { PracticePage } from "../pages/PracticePage";

const PracticeLayout = () => {
    return (
        <div className="container my-4">
            <Routes>
                <Route path="/" element={<PracticePage />} />
            </Routes>
        </div>
    );
};

export default PracticeLayout;
