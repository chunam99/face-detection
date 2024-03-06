import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import FaceApi from "./containers/FaceApi";
import Home from "./containers/Home";
import styled from "styled-components";
import IDCardScanner from "./containers/IDCardScanner";

function App() {
  return (
    <>
      <BrowserRouter>
        <WrapperNav>
          <Link to="/">Home</Link>
          <Link to="/face-detection">Face Detection</Link>
          {/* <Link to="/card-detection">Card Detection</Link> */}
        </WrapperNav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/face-detection" element={<FaceApi />} />
          {/* <Route path="/card-detection" element={<IDCardScanner />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

const WrapperNav = styled.div`
  display: flex;
  gap: 24px;
  a {
    text-decoration: none;
    color: black;
    font-size: 18px;
  }
`;

export default App;
