"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Camera, RefreshCw, Download, Upload } from "lucide-react";
import { Box, Typography } from "@mui/material";

// Styled Components
const WebcamContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  background-color: #000;
`;

const WebcamVideo = styled.video`
  width: 100%;
  /* Set an aspect ratio that closely mimics a mobile portrait view */
  aspect-ratio: 9/16;
  border-radius: 12px;
  transform: scaleX(-1);
  object-fit: cover;
`;

const PreviewImg = styled.img`
  width: 100%;
  aspect-ratio: 9/16;
  border-radius: 12px;
  object-fit: contain;
  background-color: #fff;
`;

const WebcamCanvas = styled.canvas`
  display: none;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 30px;
`;

const IconButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: #339dff;
  }

  &:active {
    transform: scale(0.9);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const WebcamCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const overlayImage = "/art.png"; // Your 1080x1920 overlay PNG

  // Standard Output Dimensions based on your art.png
  const OUTPUT_WIDTH = 1080;
  const OUTPUT_HEIGHT = 1920;

  useEffect(() => {
    setIsClient(true);
    checkPermissionsAndStart();
  }, []);

  const checkPermissionsAndStart = async () => {
    try {
      const permissions = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });

      if (permissions.state === "denied") {
        alert(
          "Camera access is blocked. Enable it in browser settings:\n\n" +
            "1️⃣ Go to Browser-Settings > Site settings > Camera > allow photopicker-three.vercel.app\n" +
            "2️⃣ Reload this page and try again.\n" +
            "Else Upload your Photo and Download it.",
        );
        return;
      }

      startWebcam();
    } catch (error) {
      console.error("Error checking permissions", error);
    }
  };

  const startWebcam = async () => {
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setMediaStream(stream);
      } catch (error) {
        console.error("Error accessing webcam", error);
      }
    } else {
      console.error("navigator.mediaDevices.getUserMedia is not available");
    }
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context && video.videoWidth && video.videoHeight) {
      const template = new Image();
      template.src = overlayImage;

      template.onload = () => {
        // 1. Set fixed high-res canvas size (1080x1920)
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;

        context.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Calculate "Cover" logic so the video fills the 1080x1920 canvas
        const scale = Math.max(
          OUTPUT_WIDTH / video.videoWidth,
          OUTPUT_HEIGHT / video.videoHeight,
        );
        const imgWidth = video.videoWidth * scale;
        const imgHeight = video.videoHeight * scale;

        // Center the video
        const imgX = (OUTPUT_WIDTH - imgWidth) / 2;
        const imgY = (OUTPUT_HEIGHT - imgHeight) / 2;

        // 3. Draw and flip the video frame
        context.save();
        context.translate(OUTPUT_WIDTH, 0); // Move to right edge
        context.scale(-1, 1); // Flip horizontally
        // Because we flipped the canvas, we need to adjust the X coordinate drawing
        context.drawImage(video, -imgX, imgY, imgWidth, imgHeight);
        context.restore();

        // 4. Draw the template over the whole thing
        context.drawImage(template, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

        // Save the final image as JPEG for better performance
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageDataUrl);
        stopWebcam();
      };

      template.onerror = () => {
        console.error("Failed to load template image.");
      };
    }
  };

  const resetState = () => {
    setCapturedImage(null);
    startWebcam();
  };

  const saveImage = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = "winmart-capture.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      reader.onload = () => {
        const uploadedImage = new Image();
        uploadedImage.src = reader.result as string;

        uploadedImage.onload = () => {
          if (!context) return;

          const template = new Image();
          template.src = overlayImage;

          template.onload = () => {
            // 1. Set fixed high-res canvas size (1080x1920)
            canvas.width = OUTPUT_WIDTH;
            canvas.height = OUTPUT_HEIGHT;

            context.clearRect(0, 0, canvas.width, canvas.height);

            // 2. Calculate "Cover" logic so the uploaded image fills the canvas
            const scale = Math.max(
              OUTPUT_WIDTH / uploadedImage.width,
              OUTPUT_HEIGHT / uploadedImage.height,
            );
            const imgWidth = uploadedImage.width * scale;
            const imgHeight = uploadedImage.height * scale;

            // Center the image
            const imgX = (OUTPUT_WIDTH - imgWidth) / 2;
            const imgY = (OUTPUT_HEIGHT - imgHeight) / 2;

            // 3. Draw the user's uploaded image (No need to flip uploaded photos)
            context.drawImage(uploadedImage, imgX, imgY, imgWidth, imgHeight);

            // 4. Draw the template overlay
            context.drawImage(template, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

            // Save final image as JPEG
            const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setCapturedImage(imageDataUrl);
            stopWebcam();
          };

          template.onerror = () => {
            console.error("Failed to load template image.");
          };
        };
      };

      reader.readAsDataURL(file);
    }
  };

  if (!isClient) return null;

  return (
    <Box>
      <WebcamContainer>
        {capturedImage ? (
          <>
            <PreviewImg src={capturedImage} alt="Captured preview" />
            <ButtonContainer>
              <IconButton onClick={resetState} color="#FF4D4D">
                <RefreshCw size={28} />
              </IconButton>
              <IconButton onClick={saveImage} color="#4CAF50">
                <Download size={28} />
              </IconButton>
            </ButtonContainer>
          </>
        ) : (
          <>
            <WebcamVideo ref={videoRef} autoPlay muted playsInline />
            <WebcamCanvas ref={canvasRef} />
            <ButtonContainer>
              <IconButton onClick={captureImage} color="#007BFF">
                <Camera size={32} />
              </IconButton>
              <label>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <IconButton as="span" color="#6A1B9A">
                  <Upload size={28} />
                </IconButton>
              </label>
            </ButtonContainer>
          </>
        )}
      </WebcamContainer>
      <Box
        mt={10}
        p={3}
        sx={{ backgroundColor: "#f8f9fa", borderRadius: 2, boxShadow: 3 }}
      >
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          WinMart ත්‍යාග ලබා දීම වෙත සාදරයෙන් පිළිගනිමු.
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
          සහභාගී වීමට මෙම පියවර සහ මඟ පෙන්වීම අනුගමනය කරන්න.
        </Typography>
        <Box mt={2}>
          <Typography variant="body1" p={2}>
            <strong>පියවර 1 :</strong> ඔබගේ ඡායාරූපයක් උඩුගත(Upload) කර හෝ
            ග්‍රහණය(Capture) කර අපගේ පිටුවේ ලාංඡනය එක් කරන්න.
          </Typography>
          <Typography variant="body1" p={2}>
            <strong>පියවර 2 :</strong> රූපය ක්‍රියාවලිය(Process) වන තෙක් මඳ
            වේලාවක් බලා සිටින්න.
          </Typography>
          <Typography variant="body1" p={2}>
            <strong>පියවර 3 :</strong> ඉන්පසු එම රූපය <strong>Download</strong>{" "}
            කරගන්න.
          </Typography>
          <Typography variant="body1" p={2}>
            <strong>පියවර 4 :</strong> <strong>Download</strong> කරගත් රූපය අපගේ
            WinMart පේජය ටැග් කර facebook මත පළ කරන්න. <br />
            <strong style={{ color: "red" }}>
              (අපගේ ෆේස්බුක් පිටුවට <strong>Like</strong> කර තිබීම අනිවාර්ය වේ.)
            </strong>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WebcamCapture;
