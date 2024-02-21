import React, { useState, useEffect } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";

const Detection = () => {
  const [model, setModel] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [specificClass, setSpecificClass] = useState("");

  useEffect(() => {
    const loadModel = async () => {
      console.log({cocoSsd})
      const newModel = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      setModel(newModel);
      setIsModelLoaded(true);
    };
    loadModel();
  }, []);

  const videoConstraints = {
    width: 500,
    height: 500,
    facingMode: "user"
  };
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(() => {
    setImageSrc(webcamRef.current.getScreenshot());
  }, [webcamRef]);


  return (
    <>
      <Webcam
        audio={false}
        height={500}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={500}
        videoConstraints={videoConstraints}
        id={"webcamFeed"}
      />
      <br />
      <button onClick={capture}>Capture photo</button>
    </>
  );
};

export default Detection;
