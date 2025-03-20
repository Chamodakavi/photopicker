"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Camera, RefreshCw, Download } from "lucide-react";

// Styled components
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
`;

const WebcamVideo = styled.video`
  width: 100%;
  border-radius: 12px;
  transform: scaleX(-1);
  object-fit: cover;

  @media (max-width: 767px) {
    height: 100vh;
    border-radius: 0;
  }
`;

const PreviewImg = styled.img`
  width: 100%;
  border-radius: 12px;
  object-fit: cover;

  @media (max-width: 767px) {
    height: 100vh;
    border-radius: 0;
  }
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

interface IconButtonProps {
  color?: string;
  textColor?: string;
  hoverColor?: string;
}

const IconButton = styled.button<IconButtonProps>`
  background-color: ${({ color }) => color || "#fff"};
  color: ${({ textColor }) => textColor || "#fff"};
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
    background-color: ${({ hoverColor }) => hoverColor || "#f0f0f0"};
  }

  &:active {
    transform: scale(0.9);
  }
`;

const WebcamCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startWebcam();
  }, []);

  const startWebcam = async () => {
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
  };

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        stopWebcam();
      }
    }
  };

  const resetState = () => {
    stopWebcam(); // Stop the webcam if it's active
    setCapturedImage(null); // Reset captured image
    startWebcam(); // Restart the webcam
  };

  const saveImage = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = "captured_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resetState(); // Reset state and restart the webcam
    }
  };

  return (
    <WebcamContainer>
      {capturedImage ? (
        <>
          <PreviewImg src={capturedImage} />
          <ButtonContainer>
            <IconButton
              onClick={resetState}
              color="#FF4D4D"
              hoverColor="#FF6B6B"
            >
              <RefreshCw size={28} />
            </IconButton>
            <IconButton
              onClick={saveImage}
              color="#4CAF50"
              hoverColor="#66BB6A"
            >
              <Download size={28} />
            </IconButton>
          </ButtonContainer>
        </>
      ) : (
        <>
          <WebcamVideo ref={videoRef} autoPlay muted />
          <WebcamCanvas ref={canvasRef} />
          <ButtonContainer>
            <IconButton
              onClick={captureImage}
              color="#007BFF"
              hoverColor="#339DFF"
            >
              <Camera size={32} />
            </IconButton>
          </ButtonContainer>
        </>
      )}
    </WebcamContainer>
  );
};

export default WebcamCapture;
