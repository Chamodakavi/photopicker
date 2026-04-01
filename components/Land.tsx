"use client";

import { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { Camera, RefreshCw, Download, Upload, Loader2 } from "lucide-react";
import { Box, Typography } from "@mui/material";

// Animations & Styled Components
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinningIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${spin} 1s linear infinite;
`;

const WebcamContainer = styled.div<{ $isCaptured: boolean }>`
  position: relative;
  width: 100%;
  max-width: ${(props) => (props.$isCaptured ? "400px" : "280px")};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  background-color: #000;
  transition: max-width 0.4s ease-in-out;
`;

const WebcamVideo = styled.video`
  width: 100%;
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

const IconButton = styled.button<{ disabled?: boolean }>`
  background-color: ${(props) => (props.disabled ? "#6c757d" : "#007bff")};
  color: white;
  border: none;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#6c757d" : "#339dff")};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "scale(0.9)")};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const WebcamCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use a ref to strictly track the stream for cleanup purposes
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const overlayImage = "/art5.png"; // Your 1080x1920 overlay PNG
  const OUTPUT_WIDTH = 1080;
  const OUTPUT_HEIGHT = 1920;

  useEffect(() => {
    setIsClient(true);
    checkPermissionsAndStart();

    // 🛡️ SECURITY: Disable Right-Click and DevTools Shortcuts
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J")) ||
        ((e.ctrlKey || e.metaKey) && e.key === "u")
      ) {
        e.preventDefault();
      }
    };

    const handleContext = (e: MouseEvent) => e.preventDefault();

    window.addEventListener("keydown", handleKey);
    window.addEventListener("contextmenu", handleContext);

    // 🧹 CLEANUP: Runs when component unmounts
    return () => {
      // Stop Camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      // Remove Security Listeners
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("contextmenu", handleContext);
    };
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
        streamRef.current = stream; // Save to ref for cleanup
      } catch (error) {
        console.error("Error accessing webcam", error);
      }
    } else {
      console.error("navigator.mediaDevices.getUserMedia is not available");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    setIsProcessing(true); // 2. Start processing state

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context && video.videoWidth && video.videoHeight) {
      const template = new Image();
      template.src = overlayImage;

      template.onload = () => {
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        context.clearRect(0, 0, canvas.width, canvas.height);

        const scale = Math.max(
          OUTPUT_WIDTH / video.videoWidth,
          OUTPUT_HEIGHT / video.videoHeight,
        );
        const imgWidth = video.videoWidth * scale;
        const imgHeight = video.videoHeight * scale;

        // Correct Mirror Flip Logic for Webcam
        context.save();
        context.translate(OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2);
        context.scale(-1, 1);
        context.drawImage(
          video,
          -imgWidth / 2,
          -imgHeight / 2,
          imgWidth,
          imgHeight,
        );
        context.restore();

        // Draw Template
        context.drawImage(template, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageDataUrl);
        stopWebcam();
        setIsProcessing(false); // End processing state
      };

      template.onerror = () => {
        // 3. User-facing error handling
        alert(
          "සමාවන්න, අන්තර්ජාල සම්බන්ධතාවයේ දෝෂයක්. කරුණාකර පිටුව Refresh කරන්න.",
        );
        setIsProcessing(false);
      };
    } else {
      setIsProcessing(false);
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
    if (file && canvasRef.current && !isProcessing) {
      setIsProcessing(true); // 2. Start processing state

      const reader = new FileReader();
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      reader.onload = () => {
        const uploadedImage = new Image();
        uploadedImage.src = reader.result as string;

        uploadedImage.onload = () => {
          if (!context) {
            setIsProcessing(false);
            return;
          }

          const template = new Image();
          template.src = overlayImage;

          template.onload = () => {
            canvas.width = OUTPUT_WIDTH;
            canvas.height = OUTPUT_HEIGHT;
            context.clearRect(0, 0, canvas.width, canvas.height);

            const scale = Math.max(
              OUTPUT_WIDTH / uploadedImage.width,
              OUTPUT_HEIGHT / uploadedImage.height,
            );
            const imgWidth = uploadedImage.width * scale;
            const imgHeight = uploadedImage.height * scale;

            // Center image (NO flipping for file uploads)
            const imgX = (OUTPUT_WIDTH - imgWidth) / 2;
            const imgY = (OUTPUT_HEIGHT - imgHeight) / 2;
            context.drawImage(uploadedImage, imgX, imgY, imgWidth, imgHeight);

            // Draw Template
            context.drawImage(template, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

            const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
            setCapturedImage(imageDataUrl);
            stopWebcam();
            setIsProcessing(false); // End processing state
          };

          template.onerror = () => {
            // 3. User-facing error handling
            alert(
              "සමාවන්න, අන්තර්ජාල සම්බන්ධතාවයේ දෝෂයක්. කරුණාකර පිටුව Refresh කරන්න.",
            );
            setIsProcessing(false);
          };
        };
      };

      reader.onerror = () => {
        alert("ෆොටෝ එක ලබාගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.");
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    }
  };

  if (!isClient) return null;

  return (
    <Box onContextMenu={(e) => e.preventDefault()}>
      <WebcamContainer $isCaptured={!!capturedImage}>
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
              <IconButton
                onClick={captureImage}
                color="#007BFF"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <SpinningIcon>
                    <Loader2 size={32} />
                  </SpinningIcon>
                ) : (
                  <Camera size={32} />
                )}
              </IconButton>
              <label>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <IconButton
                  as="span"
                  color="#6A1B9A"
                  disabled={isProcessing}
                  style={{
                    backgroundColor: isProcessing ? "#6c757d" : "#6A1B9A",
                  }}
                >
                  {isProcessing ? (
                    <SpinningIcon>
                      <Loader2 size={28} />
                    </SpinningIcon>
                  ) : (
                    <Upload size={28} />
                  )}
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
