import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import UploadPage from "./pages/UploadPage";
import PreviewPage from "./pages/PreviewPage";
import PortfolioPage from "./pages/PortfolioPage";

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<UploadPage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/portfolio/:slug" element={<PortfolioPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;