import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import outlineFace from "../assets/outline-front-1.png";
import * as faceapi from "face-api.js";
import styled from "styled-components";

const inputResolution = {
  width: 1280,
  height: 720,
};

const videoConstraints = {
  width: inputResolution.width,
  height: inputResolution.height,
  facingMode: "user",
};

function Document() {
  const webcamRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const detectDocument = async (frame) => {
    // Thực hiện nhận diện văn bản bằng Tesseract.js
    const {
      data: { text },
    } = await Tesseract.recognize(frame, "eng", {
      logger: (info) => console.log(info),
    });

    if (text.trim() !== "") {
      console.log({ text });
      captureImage();
    } else {
      console.log("Không tìm thấy giấy tờ hoặc văn bản trong ảnh.");
    }
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const handleDocumentDetection = (documentInfo) => {
    if (
      documentInfo.xMin >= 100 &&
      documentInfo.xMax <= 500 &&
      documentInfo.yMin >= 100 &&
      documentInfo.yMax <= 300
    ) {
      detectDocument(documentInfo.frame);
    }
  };

  const runDetector = () => {
    // Thực hiện logic nhận diện giấy tờ và gọi handleDocumentDetection khi có kết quả
    const intervalId = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const frame = webcamRef.current.getCanvas();

        console.log({ frame });

        // Thực hiện logic nhận diện giấy tờ tại đây, và gọi handleDocumentDetection khi có kết quả
        // Ví dụ:
        const documentInfo = {
          xMin: 100,
          xMax: 500,
          yMin: 100,
          yMax: 300,
          frame,
        };
        handleDocumentDetection(documentInfo);
      }
    }, 1000); // Chạy mỗi giây, bạn có thể điều chỉnh tần suất theo nhu cầu

    return () => clearInterval(intervalId);
  };

  useEffect(() => {
    // Chạy hàm nhận diện khi component được mount
    const cleanup = runDetector();

    // Hủy interval khi component bị unmount
    return cleanup;
  }, []); // Chạy chỉ một lần sau khi component mount

  const handleVideoLoad = useCallback(
    (videoNode) => {
      const video = videoNode.target;
      if (video.readyState === 4) {
        runDetector();
      }
    },
    [runDetector]
  );

  return (
    <div>
      {!capturedImage ? (
        <WrapperWebcam>
          <Webcam
            className="webcam"
            ref={webcamRef}
            width={inputResolution.width}
            height={inputResolution.height}
            videoConstraints={videoConstraints}
            onLoadedData={handleVideoLoad}
          />
          {countdown !== null && (
            <CountdownOverlay>{countdown}</CountdownOverlay>
          )}
          <img src={outlineFace} alt="" />
        </WrapperWebcam>
      ) : (
        <img src={capturedImage} key={"image-preview"} alt="Detected face" />
      )}
    </div>
  );
}

const WrapperWebcam = styled.div`
  position: relative;
  width: max-content;

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
  }

  .webcam {
    transform: scaleX(-1);
  }
`;

const CountdownOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: white;
`;

export default Document;
