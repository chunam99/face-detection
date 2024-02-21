import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import Swal from 'sweetalert2';

const IDCardScanner = () => {
  const webcamRef = useRef(null);
  let count = 0;
  let scanning = true;

  useEffect(() => {
    const drawVideo = async () => {
      if (!webcamRef.current) return;

      const video = webcamRef.current.video;

      try {
        console.log({cocoSsd})
        const model = await cocoSsd.load('ssdlite_mobilenet_v2');
        console.log('Loaded model', model);
        
        const detectCard = async () => {
          const predictions = await model.detect(video);

          predictions.forEach(async (prediction) => {
            const bbox = prediction.bbox;

            if (prediction.class === 'person') {
              count += 1;

              if (count >= 5) {
                const result = await Swal.fire({
                  title: 'Do you want to save the image?',
                  showDenyButton: true,
                  showCancelButton: true,
                  confirmButtonText: 'Yes',
                  denyButtonText: 'No',
                  customClass: {
                    actions: 'my-actions',
                    cancelButton: 'order-1 right-gap',
                    confirmButton: 'order-2',
                    denyButton: 'order-3',
                  },
                });

                if (result.isConfirmed) {
                  Swal.fire('Saved!', '', 'success');
                } else if (result.isDenied) {
                  Swal.fire('Changes are not saved', '', 'info');
                }

                count = 0;
              }
            } else {
              count = 0;
            }
          });
        };

        const scanLoop = async () => {
          while (scanning) {
            await detectCard();
            await new Promise((r) => setTimeout(r, 50));
          }
        };

        scanLoop();
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };

    drawVideo();
  }, []);

  return (
    <div className="card-wrapper">
      <div id="camera-section">
        <Webcam
          ref={webcamRef}
          style={{ position: 'absolute', left: 0 }}
          width={800}
          height={600}
          screenshotFormat="image/jpeg"
        />
      </div>
      <div id="preview">
        <img src="" id="preview-img" alt="" />
      </div>
    </div>
  );
};

export default IDCardScanner;
