import React, { useEffect } from 'react';

const OpenCvLoader = ({ onOpenCvReady }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/master/opencv.js';
    script.async = true;
    script.onload = () => {
      if (onOpenCvReady && typeof onOpenCvReady === 'function') {
        onOpenCvReady();
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onOpenCvReady]);

  return null;
};

export default OpenCvLoader;
