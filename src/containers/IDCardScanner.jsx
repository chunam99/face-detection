import React, { useEffect, useRef, useState } from "react";
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
  const [count, setCount] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const drawVideo = async () => {
      let context;
      let canvas;
      context = cropFrameRef.current.getContext("2d");

      try {
        const model = await cocoSsd.load();
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
              // setCount((prevCount) => prevCount + 1);
              // if (count >= 5) {
              //   drawBoundingBox(context, [
              //     bbox[0] + xRatio,
              //     bbox[1] + yRatio,
              //     bbox[2],
              //     bbox[3],
              //   ]);
              //   handleCaptureImage();
              //   setScanning(false);
              // }
              drawBoundingBox(context, [
                bbox[0] + xRatio,
                bbox[1] + yRatio,
                bbox[2],
                bbox[3],
              ]);
              handleCaptureImage();
              setScanning(false);
            } else {
              setCount(0);
            }
          });
        };

        while (scanning) {
          await detectCard();
          await new Promise((r) => setTimeout(r, 50));
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    drawVideo();

    return () => {
      setScanning(false);
    };
  }, [scanning, count]);

  const handleCaptureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  return (
    <WrapperWebcam>
      {!capturedImage ? (
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
          <img src={capturedImage} id="preview-img" alt="" />
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
