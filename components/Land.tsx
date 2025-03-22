"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Camera, RefreshCw, Download, Upload } from "lucide-react";
import { Facebook } from "lucide-react";

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
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  const overlayImage = "/art.png"; // Change this path to your overlay PNG

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
            "Else Upload your Photo and Download it."
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
      template.src = overlayImage; // PNG template with logo at the bottom

      template.onload = () => {
        if (!context) return;

        const templateWidth = template.width;
        const templateHeight = template.height;

        // Resize canvas to match the template size
        canvas.width = templateWidth;
        canvas.height = templateHeight;

        // Define available space for the captured image
        const availableHeight = templateHeight * 0.75; // Space above the logo
        const availableWidth = templateWidth;

        // Maintain aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight;
        let imgWidth = availableWidth;
        let imgHeight = imgWidth / aspectRatio;

        if (imgHeight > availableHeight) {
          imgHeight = availableHeight;
          imgWidth = imgHeight * aspectRatio;
        }

        // Center the image within the available space
        const imgX = (templateWidth - imgWidth) / 2;
        const imgY = 0; // Start from the top of the template

        // Clear the canvas before drawing
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Flip and draw the captured video frame
        context.save();
        context.translate(imgWidth, 0); // Move right by image width
        context.scale(-1, 1); // Flip horizontally
        context.drawImage(video, -imgX, imgY, imgWidth, imgHeight);
        context.restore();

        // Draw the template (logo at bottom)
        context.drawImage(template, 0, 0, templateWidth, templateHeight);

        // Save the final image
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        uploadToCloudinary(imageDataUrl);
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
      link.download = "captured_image.jpg";
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
          template.src = overlayImage; // Your PNG template (Winmart logo at the bottom)

          template.onload = () => {
            if (!context) return;

            const templateWidth = template.width;
            const templateHeight = template.height;

            // Resize canvas to match the template
            canvas.width = templateWidth;
            canvas.height = templateHeight;

            // Define space for uploaded image (above the logo)
            const availableHeight = templateHeight * 0.75; // Adjust based on your template
            const availableWidth = templateWidth;

            // Maintain aspect ratio of uploaded image
            const aspectRatio = uploadedImage.width / uploadedImage.height;
            let imgWidth = availableWidth;
            let imgHeight = imgWidth / aspectRatio;

            if (imgHeight > availableHeight) {
              imgHeight = availableHeight;
              imgWidth = imgHeight * aspectRatio;
            }

            // Position uploaded image inside the empty space
            const imgX = (templateWidth - imgWidth) / 2;
            const imgY = 0; // Start from top of template

            // Draw uploaded image inside the empty space
            context.drawImage(uploadedImage, imgX, imgY, imgWidth, imgHeight);

            // Draw the template (Winmart logo at the bottom)
            context.drawImage(template, 0, 0, templateWidth, templateHeight);

            // Save final image
            const imageDataUrl = canvas.toDataURL("image/png");
            setCapturedImage(canvas.toDataURL("image/png"));
            uploadToCloudinary(imageDataUrl);
          };

          template.onerror = () => {
            console.error("Failed to load template image.");
          };
        };
      };

      reader.readAsDataURL(file);
    }
  };

  const uploadToCloudinary = async (imageDataUrl: string | Blob) => {
    const cloudName = "drcnnul87";
    const uploadPreset = "winmart";

    try {
      const formData = new FormData();
      formData.append("file", imageDataUrl);
      formData.append("upload_preset", uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Uploaded Image URL:", data.secure_url);
      setCloudinaryUrl(data.secure_url);
      alert(`Image uploaded successfully!\nURL: ${data.secure_url}`);
    } catch (error) {
      console.error("Error uploading to Cloudinary", error);
    }
  };
  const shareOnFacebook = () => {
    if (!cloudinaryUrl) {
      alert("Upload an image first!");
      return;
    }

    const fbPageId = "YOUR_PAGE_ID"; // Replace with the Facebook Page ID you want to tag
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      cloudinaryUrl
    )}`;

    window.open(fbShareUrl, "_blank");
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
            {cloudinaryUrl && (
              <IconButton
                onClick={shareOnFacebook}
                style={{ backgroundColor: "#1877F2" }}
              >
                <Facebook size={28} color="white" />
              </IconButton>
            )}
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
