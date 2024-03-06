import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Swal from "sweetalert2";
import styled from "styled-components";
import outline from "../assets/outline-front-1.png";
const cocoSsd = require("@tensorflow-models/coco-ssd");

const inputResolution = {
  width: 1280,
  height: 720,
};
const IDCardScanner = () => {
  const webcamRef = useRef(null);
  const cropFrameRef = useRef(null);
  const intervalRef = useRef(null);
  const detection = useRef();

  const [scanning, setScanning] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [hasCard, setHasCard] = useState(false);
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    return () => {
      clearInterval(detection.current);
      clearInterval(intervalRef.current);
    };
  }, [captured]);

  useEffect(() => {
    const drawVideo = async () => {
      let context;
      let canvas;
      context = cropFrameRef.current.getContext("2d");
      detection.current = setInterval(async () => {
        if (webcamRef.current) {
          console.log({ cocoSsd });
          const model = await cocoSsd.load();
          console.log({ model });
          const xRatio = (webcamRef.current.video.clientWidth / 100) * 25;
          const yRatio = (webcamRef.current.video.clientHeight / 100) * 22;
          const widthRatio = (webcamRef.current.video.clientWidth / 100) * 50;
          const heightRatio = (webcamRef.current.video.clientHeight / 100) * 55;

          const drawBoundingBox = (context, bbox, color = "red") => {
            context.beginPath();
            context.rect(bbox[0], bbox[1], bbox[2], bbox[3]);
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
          };

          const detectCard = async () => {
            context.drawImage(
              webcamRef.current.video,
              0,
              0,
              webcamRef.current.video.clientWidth,
              webcamRef.current.video.clientHeight
            );
            const imageData = context.getImageData(
              xRatio,
              yRatio,
              widthRatio,
              heightRatio
            );
            canvas = cropFrameRef.current;
            context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawBoundingBox(
              context,
              [xRatio, yRatio, widthRatio, heightRatio],
              "transparent"
            );
            const predictions = await model.detect(imageData);
            predictions.forEach(async (prediction) => {
              const bbox = prediction.bbox;
              console.log(prediction);
              if (prediction.class === "book") {
                drawBoundingBox(context, [
                  bbox[0] + xRatio,
                  bbox[1] + yRatio,
                  bbox[2],
                  bbox[3],
                ]);
                setHasCard(true);
                setScanning(false);
              } else {
                setHasCard(false);
              }
            });
          };

          while (scanning) {
            await detectCard();
            await new Promise((r) => setTimeout(r, 50));
          }
        } else {
          console.error("video.readyState is null or undefined");
        }
      });
    };

    drawVideo();

    return () => {
      setScanning(false);
    };
  }, [scanning]);

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
    } else {
      console.error("webcamRef is null or undefined");
    }
  }, []);

  useEffect(() => {
    if (hasCard) {
      startCountdown(5, captureImage);
    }
  }, [hasCard, startCountdown, captureImage]);

  return (
    <WrapperWebcam>
      {!imageSrc ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={inputResolution.width}
            height={inputResolution.height}
          />
          <canvas
            style={{ position: "absolute", left: 0 }}
            width="1280"
            height="720"
            ref={cropFrameRef}
            id="crop-frame"
          />
          <canvas
            style={{ position: "absolute", left: 0 }}
            width="800"
            height="600"
            id="boundingBoxCanvas"
          />
          <img src={outline} alt="" />
        </>
      ) : (
        <div id="preview">
          <img src={imageSrc} id="preview-img" alt="" />
        </div>
      )}
    </WrapperWebcam>
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

export default IDCardScanner;
