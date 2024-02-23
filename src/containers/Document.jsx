import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import styled from "styled-components";
import outline from "../assets/outline-front-1.png";
import Tesseract from "tesseract.js";

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
  const detection = useRef();

  const [countdown, setCountdown] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [outlinePosition, setOutlinePosition] = useState({ top: '50%', left: '50%' });

  // Hàm này được gọi khi video feed được load
  useEffect(() => {
    return () => {
      clearInterval(detection.current);
    };
  }, []);

  const handleVideoLoad = () => {
    const video = webcamRef.current.video;
    setVideoDimensions({ width: video.width, height: video.height });

    // Lấy thông tin về vị trí của phần tử .webcam trên màn hình
    const webcamElement = document.querySelector('.webcam');
    const rect = webcamElement.getBoundingClientRect();

    // Tính toán vị trí mới của outlineFace dựa trên vị trí của .webcam
    const newOutlinePosition = {
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width / 2,
    };

    setOutlinePosition(newOutlinePosition);
  };

  // Hàm này được gọi khi component được mount hoặc video feed được load
  useEffect(() => {
    handleVideoLoad();
  }, [webcamRef.current]);

  // Hàm này được gọi khi có thay đổi về vị trí hoặc kích thước của outline position
  useEffect(() => {
    detectIDCard();
  }, []);

  const detectDocument = async (frame) => {
    // Thực hiện nhận diện văn bản bằng Tesseract.js
    const { data: { text } } = await Tesseract.recognize(frame, "eng", {
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

  const detectIDCard = async () => {
    detection.current = setInterval(async () => {
      if (webcamRef.current) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "facenet/models/tiny_face_detector"
        );
  
        const faces = await faceapi.detectAllFaces(
          webcamRef.current.video,
          new faceapi.TinyFaceDetectorOptions()
        );
  
        if (faces.length > 0) {
          console.log("person")
        }
        else {
          const idCardWidth = 640;
          const idCardHeight = 405;
  
          // const outlineLeft = 648;
          // const outlineTop = 368;
          const video = webcamRef.current.video;

          const isIDCardDetectedInOutline = (
            outlinePosition.left >=  (video.clientWidth / 100) * 30 &&
            outlinePosition.top >= (video.clientHeight / 100) * 30 &&
            outlinePosition.left + idCardWidth <= (video.clientWidth / 100) + idCardWidth &&
            outlinePosition.top + idCardHeight <= (video.clientHeight / 100) * 30 + idCardHeight
          );

          console.log("(video.clientHeight / 100)", (video.clientHeight / 100))

  
          if (isIDCardDetectedInOutline) {
            console.log("trong khung");
            detectDocument();

          }
        }
      }  
    },100)
    
  };

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
          <img
            src={outline}
            alt=""
          />
        </WrapperWebcam>
      ) : (
        <img src={capturedImage} key={"image-preview"} alt="Detected ID card" />
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
