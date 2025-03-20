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
`;

const PreviewImg = styled.img`
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
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
  hoverColor?: string;
}

const IconButton = styled.button<IconButtonProps>`
  background-color: ${({ color }) => color || "#fff"};
  border: none;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
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

  const overlayImageSrc = "/water.webp";

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

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Flip the image horizontally
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Load overlay image with crossOrigin
        const overlayImg = new Image();
        overlayImg.src = overlayImageSrc;
        overlayImg.crossOrigin = "anonymous"; // ✅ Prevent tainting the canvas

        await new Promise((resolve) => {
          overlayImg.onload = resolve;
        });

        // Draw overlay
        const overlayWidth = canvas.width * 0.5;
        const overlayHeight =
          overlayImg.height * (overlayWidth / overlayImg.width);
        const overlayX = canvas.width / 2 - overlayWidth / 2;
        const overlayY = canvas.height - overlayHeight - 20;

        context.drawImage(
          overlayImg,
          overlayX,
          overlayY,
          overlayWidth,
          overlayHeight
        );

        // Save final image
        const imageDataUrl = canvas.toDataURL("image/jpeg"); // ✅ No tainting issue
        setCapturedImage(imageDataUrl);
        stopWebcam();
      }
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
      link.download = "captured_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resetState();
    }
  };

  return (
    <WebcamContainer>
      {capturedImage ? (
        <>
          <PreviewImg src={capturedImage} />
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
          <WebcamVideo ref={videoRef} autoPlay muted />
          <WebcamCanvas ref={canvasRef} />
          <ButtonContainer>
            <IconButton onClick={captureImage} color="#007BFF">
              <Camera size={32} />
            </IconButton>
          </ButtonContainer>
        </>
      )}
    </WebcamContainer>
  );
};

export default WebcamCapture;
