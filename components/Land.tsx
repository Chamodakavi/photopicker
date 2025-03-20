import { Button } from "@mui/material";
import { useRef, useState, useEffect } from "react";

const Land = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captured, setCaptured] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(console.error);
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const overlay = new Image();
      overlay.src = "/save_water.png"; // Update with correct path
      overlay.onload = () => {
        ctx.drawImage(overlay, 20, 20, 150, 150);
        setCaptured(true);
      };
    }
  };

  const downloadPhoto = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "captured_photo.png";
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <video
        ref={videoRef}
        autoPlay
        className="w-full max-w-md rounded shadow"
      />
      <Button onClick={capturePhoto}>Capture Photo</Button>
      <canvas
        ref={canvasRef}
        className={`rounded shadow ${captured ? "block" : "hidden"}`}
      />
      {captured && <Button onClick={downloadPhoto}>Download Image</Button>}
    </div>
  );
};

export default Land;
