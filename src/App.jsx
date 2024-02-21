import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Document from "./containers/Document";
import FaceApi from "./containers/FaceApi";
import IDCardScanner from "./containers/IDCardScanner";
import Detection from "./containers/Detection";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IDCardScanner />} />
        <Route path="face-api" element={<FaceApi />} />
        <Route path="document" element={<Document />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
