import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import outlineFace from "../assets/outline-face.png";
import outlineFaceError from "../assets/outline-face-error.png";
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

const FaceApi = () => {
  const detection = useRef();
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);

  const [imgOutline, setImgOutline] = useState(outlineFace);
  const [imageSrc, setImageSrc] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [hasFace, setHasFace] = useState(false);
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    return () => {
      clearInterval(detection.current);
    };
  }, [captured]);

  const handleResults = useCallback((faces) => {
    if (faces && faces.length > 0) {
      const firstFace = faces[0];
      if (firstFace._box) {
        const { _x, _y, _width, _height } = firstFace._box;

        const isFaceWithinBounds =
          _x >= 441.6942423901771 &&
          _x + _width <= 441.6942423901771 + 363.9312779823689 &&
          _y >= 239.70332248890426 &&
          _y + _height <= 239.70332248890426 + 351.6706103282493;

        if (isFaceWithinBounds) {
          setImgOutline(outlineFace);
          setHasFace(true);
        } else {
          setCountdown(null);
          setHasFace(false);
          setImgOutline(outlineFaceError);
          clearInterval(intervalRef.current);
        }
      }
    }
  }, []);

  const handleStreamVideo = useCallback(async () => {
    detection.current = setInterval(async () => {
      if (webcamRef.current) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "facenet/models/tiny_face_detector"
        );
        const faces = await faceapi.detectAllFaces(
          webcamRef.current.video,
          new faceapi.TinyFaceDetectorOptions()
        );
        console.log({ faces });
        handleResults(faces);
      }
    }, 100);
  }, [handleResults]);

  const startCountdown = useCallback((duration, callback) => {
    setCountdown(duration);
    const intervalId = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount === 1) {
          clearInterval(intervalId);
          callback();
        }
        return prevCount - 1;
      });
    }, 1000);
    intervalRef.current = intervalId;
  }, []);

  const captureImage = useCallback(() => {
    console.log("capturing image");
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
    setCaptured(true);
  }, []);

  useEffect(() => {
    if (hasFace) {
      startCountdown(5, captureImage);
    }
  }, [hasFace, startCountdown, captureImage]);

  const handleVideoLoad = useCallback(
    (videoNode) => {
      const video = videoNode.target;
      if (video.readyState === 4) {
        handleStreamVideo();
      }
    },
    [handleStreamVideo]
  );

  return (
    <div>
      {!imageSrc ? (
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
          <img src={imgOutline} alt="" />
        </WrapperWebcam>
      ) : (
        <img src={imageSrc} key={"image-preview"} alt="Detected face" />
      )}
    </div>
  );
};

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

export default FaceApi;
