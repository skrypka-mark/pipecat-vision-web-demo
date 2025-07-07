import React, { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { useRTVIClientMediaDevices } from "realtime-ai-react";

import { Button } from "./button";

export const CameraFlipButton: React.FC = () => {
  const { availableCams, selectedCam, updateCam } = useRTVIClientMediaDevices();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if user is on mobile device
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobile(isMobileDevice || hasTouch);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const flipCamera = async () => {
    console.log("availableCams", availableCams);

    if (availableCams.length < 2) return;

    // Try to find front and back cameras
    const frontCamera = availableCams.find(
      (cam) =>
        cam.label.toLowerCase().includes("front") ||
        cam.label.toLowerCase().includes("user")
    );

    const backCamera = availableCams.find(
      (cam) =>
        cam.label.toLowerCase().includes("back") ||
        cam.label.toLowerCase().includes("rear") ||
        cam.label.toLowerCase().includes("environment")
    );

    // If we can't detect by label, just switch to the next available camera
    if (!frontCamera || !backCamera) {
      const currentIndex = availableCams.findIndex(
        (cam) => cam.deviceId === selectedCam?.deviceId
      );
      const nextIndex = (currentIndex + 1) % availableCams.length;
      updateCam(availableCams[nextIndex].deviceId);
      return;
    }

    // Switch between front and back
    const isCurrentlyFront = selectedCam?.deviceId === frontCamera.deviceId;
    const targetCamera = isCurrentlyFront ? backCamera : frontCamera;
    updateCam(targetCamera.deviceId);
  };

  // Only show the button if on mobile and multiple cameras are available
  if (!isMobile || availableCams.length < 2) {
    return null;
  }

  return (
    <Button
      variant="light"
      size="icon"
      onClick={flipCamera}
      className="rounded-full bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-black/30"
      title="Flip camera"
    >
      <RotateCw size={20} />
    </Button>
  );
};

export default CameraFlipButton;
