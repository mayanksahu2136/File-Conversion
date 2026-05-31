import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ImgToPdf from "./pages/ImgToPdf";
import PdfToImg from "./pages/PdfToImg";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/tools/image-to-pdf"
          element={<ImgToPdf />}
        />

        <Route
          path="/tools/pdf-to-image"
          element={<PdfToImg />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;