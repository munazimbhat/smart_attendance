"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Camera, CheckCircle, Loader, AlertCircle, UserPlus } from "lucide-react";
import {
  initializeFaceDetectionModels,
  detectFaces,
  drawDetectionsOnCanvas,
  validateFaceQuality,
} from "@/lib/face-recognition";
import { faceApi } from "@/lib/api";

interface FaceRegistrationProps {
  studentId: string;
  studentName: string;
  onRegistered?: () => void;
}

export function FaceRegistrationComponent({
  studentId,
  studentName,
  onRegistered,
}: FaceRegistrationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const descriptorRef = useRef<Float32Array | null>(null);
  const runningRef = useRef(false);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [message, setMessage] = useState("Click 'Start Camera' to begin");
  const [status, setStatus] = useState<"idle" | "scanning" | "capturing" | "success" | "error">("idle");
  const [registering, setRegistering] = useState(false);
  const [hasDescriptor, setHasDescriptor] = useState(false);

  // Initialize face detection models
  useEffect(() => {
    const initModels = async () => {
      try {
        const success = await initializeFaceDetectionModels();
        if (success) {
          setModelsLoaded(true);
        } else {
          setMessage("Failed to load AI models");
        }
      } catch (error) {
        console.error("Failed to initialize models:", error);
        toast.error("Failed to load face detection models");
      }
    };
    initModels();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const runDetectionLoop = async () => {
    if (!runningRef.current || !videoRef.current || !canvasRef.current) return;

    try {
      const detections = await detectFaces(videoRef.current);

      if (canvasRef.current && videoRef.current) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };
        if (displaySize.width > 0 && displaySize.height > 0) {
          canvasRef.current.width = displaySize.width;
          canvasRef.current.height = displaySize.height;
          drawDetectionsOnCanvas(canvasRef.current, detections, [studentName]);
        }
      }

      if (detections.length > 0) {
        const validation = validateFaceQuality(detections[0]);

        if (!validation.isValid) {
          setMessage(validation.message);
          setStatus("scanning");
          descriptorRef.current = null;
          setHasDescriptor(false);
        } else if (detections[0].descriptor) {
          descriptorRef.current = detections[0].descriptor;
          setHasDescriptor(true);
          setMessage("✓ Face detected! Click 'Register Face' to save.");
          setStatus("capturing");
        } else {
          setMessage("Face detected but no descriptor - hold still...");
          setStatus("scanning");
        }
      } else {
        descriptorRef.current = null;
        setHasDescriptor(false);
        setStatus("scanning");
        setMessage("No face detected - Position your face in the frame");
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }

    if (runningRef.current) {
      animationRef.current = requestAnimationFrame(runDetectionLoop);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          setMessage("Position your face clearly in the frame");
          runningRef.current = true;
          // Small delay to ensure video is playing
          setTimeout(() => {
            runDetectionLoop();
          }, 500);
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Failed to access camera");
      setMessage("Camera access denied");
    }
  };

  const stopCamera = () => {
    runningRef.current = false;
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCameraActive(false);
    descriptorRef.current = null;
    setHasDescriptor(false);
    setStatus("idle");
    setMessage("Click 'Start Camera' to begin");
  };

  const handleRegister = async () => {
    const desc = descriptorRef.current;
    if (!desc) {
      toast.error("No face detected to register");
      return;
    }

    setRegistering(true);
    try {
      const embeddingStr = JSON.stringify(Array.from(desc));
      await faceApi.register(studentId, embeddingStr);

      setStatus("success");
      setMessage(`✓ Face registered successfully for ${studentName}!`);
      toast.success(`Face registered for ${studentName}`);
      onRegistered?.();

      // Stop camera after successful registration
      setTimeout(() => {
        stopCamera();
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setStatus("error");
      setMessage("Failed to register face. Please try again.");
      toast.error("Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      {/* Video Container */}
      <div className="relative rounded-xl overflow-hidden shadow-xl aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />

        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80">
            <Camera className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-400 text-lg">Camera not active</p>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <motion.div
        layout
        className={`p-4 rounded-lg flex items-start gap-3 ${
          status === "success"
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
            : status === "error"
            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
            : status === "capturing"
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
            : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
        }`}
      >
        <div className="mt-0.5">
          {status === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : status === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : status === "capturing" ? (
            <UserPlus className="w-5 h-5" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="font-semibold">{message}</p>
          {status === "scanning" && (
            <p className="text-sm mt-1">Looking for a face...</p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            disabled={!modelsLoaded}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {!modelsLoaded ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Loading Models...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Start Camera
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleRegister}
              disabled={!hasDescriptor || registering || status === "success"}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {registering ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Register Face
                </>
              )}
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!cameraActive && status === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-700 dark:text-blue-400 text-sm space-y-2"
        >
          <p className="font-semibold">📋 Face Registration Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click &quot;Start Camera&quot; to begin</li>
            <li>Position the student&apos;s face clearly in the frame</li>
            <li>Ensure good, even lighting</li>
            <li>Wait for the blue &quot;Face detected&quot; message</li>
            <li>Click &quot;Register Face&quot; to save</li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
