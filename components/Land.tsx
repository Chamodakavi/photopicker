"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Camera, RefreshCw, Download, Upload } from "lucide-react";

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
  const overlayImage = "/water.webp"; // Change this path to your overlay PNG

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
            "1️⃣ Go to Settings > Apps > Browser > Permissions > Camera > Allow\n" +
            "2️⃣ Reload this page and try again."
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Flip video horizontally
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Load and draw overlay image
      const overlay = new Image();
      overlay.src = overlayImage;
      overlay.onload = () => {
        context.drawImage(
          overlay,
          canvas.width - 150,
          canvas.height - 100,
          120,
          80
        );

        // Ensure the updated image is saved
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
      };

      overlay.onerror = () => {
        console.error("Failed to load overlay image.");
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
      link.download = "captured_image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openCameraSettings = () => {
    window.location.href = "chrome://settings/content/camera";
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

          // Set canvas dimensions to match the uploaded image
          canvas.width = uploadedImage.width;
          canvas.height = uploadedImage.height;

          // Draw the uploaded image on the canvas
          context.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

          // Load and draw the overlay image
          const overlay = new Image();
          overlay.src = overlayImage;
          overlay.onload = () => {
            context.drawImage(
              overlay,
              canvas.width - 150,
              canvas.height - 100,
              120,
              80
            );

            // Save the modified image with overlay
            setCapturedImage(canvas.toDataURL("image/jpeg"));
          };

          overlay.onerror = () => {
            console.error("Failed to load overlay image.");
          };
        };
      };

      reader.readAsDataURL(file);
    }
  };

  if (!isClient) return null; // Prevents Next.js hydration errors

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
            <IconButton onClick={openCameraSettings} color="#FFA500">
              🔧
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
  );
};

export default WebcamCapture;
