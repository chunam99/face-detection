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
  const [webcamKey, setWebcamKey] = useState(0);

  useEffect(() => {
    return () => {
      clearInterval(detection.current);
      clearInterval(intervalRef.current);
    };
  }, [captured]);

  const handleResults = useCallback((faces) => {
    if (faces && faces.length > 0) {
      const firstFace = faces[0];
      if (firstFace._box) {
        const { x, y, width, height } = firstFace._box;

        const isFaceWithinBounds =
          x >= 400.1292277729856 &&
          x + width <= 500.1292277729856 + 377.2922763838725 &&
          y >= 200.37791837109978 &&
          y + height <= 300.37791837109978 + 335.4877796357128;

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
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "facenet/models/tiny_face_detector"
        );

        const faces = await faceapi.detectAllFaces(
          webcamRef.current.video,
          new faceapi.TinyFaceDetectorOptions()
        );
        handleResults(faces);
      } else {
        console.error("video.readyState is null or undefined");
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
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageSrc(imageSrc);
      setCaptured(true);
      setWebcamKey((prevKey) => prevKey + 1);
    } else {
      console.error("webcamRef is null or undefined");
    }
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
    <>
      <WrapperTitle>Face detection</WrapperTitle>
      <WrapperDiv>
        {!imageSrc ? (
          <WrapperWebcam>
            <Webcam
              key={webcamKey}
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
      </WrapperDiv>
    </>
  );
};

const WrapperTitle = styled.h2`
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 24px;
`;

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
    max-width: 100%;
  }
`;

const WrapperDiv = styled.div`
  transform: scaleX(-1);
  display: flex;
  justify-content: center;
`;

const CountdownOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  color: white;
  transform: scaleX(-1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export default FaceApi;
