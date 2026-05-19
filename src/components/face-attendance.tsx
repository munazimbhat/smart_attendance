"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Camera, AlertCircle, CheckCircle, Loader } from "lucide-react";
import {
  initializeFaceDetectionModels,
  detectFaces,
  drawDetectionsOnCanvas,
  validateFaceQuality,
  matchFaceAgainstEnrolled,
} from "@/lib/face-recognition";
import { attendanceApi, faceApi } from "@/lib/api";

interface FaceAttendanceProps {
  classId: string;
  studentId?: string;
  onAttendanceMarked?: (studentId: string) => void;
}

export function FaceAttendanceComponent({
  classId,
  studentId,
  onAttendanceMarked,
}: FaceAttendanceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [message, setMessage] = useState("Initializing camera...");
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [enrolledEmbeddings, setEnrolledEmbeddings] = useState<Map<string, any>>(new Map());

  // Initialize face detection models
  useEffect(() => {
    const initModels = async () => {
      try {
        const success = await initializeFaceDetectionModels();
        if (success) {
          setModelsLoaded(true);
          setMessage("Camera ready");
        }
      } catch (error) {
        console.error("Failed to initialize models:", error);
        toast.error("Failed to load face detection models");
      }
    };

    initModels();
  }, []);

  // Start camera
  useEffect(() => {
    if (!modelsLoaded) return;

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
            setMessage("Camera started - Position your face");
            detectFacesInVideo();
          };
        }
      } catch (error) {
        console.error("Camera error:", error);
        toast.error("Failed to access camera");
        setMessage("Camera access denied");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [modelsLoaded]);

  // Detect faces in video feed
  const lastRecognizeRef = useRef<number>(0);
  const markedStudentsRef = useRef<Set<string>>(new Set());

  const detectFacesInVideo = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;

    try {
      const detections = await detectFaces(videoRef.current);

      if (canvasRef.current) {
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };
        canvasRef.current.width = displaySize.width;
        canvasRef.current.height = displaySize.height;
        drawDetectionsOnCanvas(canvasRef.current, detections);
      }

      if (detections.length > 0) {
        setFaceDetected(true);

        // Validate face quality
        const validation = validateFaceQuality(detections[0]);
        if (!validation.isValid) {
          setMessage(validation.message);
          setStatus("idle");
        } else {
          setMessage("Face detected ✓ Processing...");
          setStatus("scanning");

          // Debounce: only call recognize API every 2 seconds
          const now = Date.now();
          if (detections[0].descriptor && now - lastRecognizeRef.current > 2000) {
            lastRecognizeRef.current = now;
            const result = await recognizeStudent(detections[0].descriptor);
            if (result.success && result.studentId && !markedStudentsRef.current.has(result.studentId)) {
              markedStudentsRef.current.add(result.studentId);
              setStatus("success");
              setMessage(`✓ ${result.studentName} Marked Present`);
              onAttendanceMarked?.(result.studentId);

              // Mark attendance
              await attendanceApi.mark(result.studentId, classId, "PRESENT", result.confidence);
              toast.success(`Attendance marked for ${result.studentName}`);
            } else if (!result.success) {
              setStatus("error");
              setMessage("Face not recognized - Please register first");
            }
          }
        }
      } else {
        setFaceDetected(false);
        setStatus("idle");
        setMessage("No face detected - Please position your face");
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }

    animationRef.current = requestAnimationFrame(detectFacesInVideo);
  }, [classId, modelsLoaded, onAttendanceMarked]);

  const recognizeStudent = async (descriptor: Float32Array) => {
    try {
      const response = await faceApi.recognize(
        JSON.stringify(Array.from(descriptor))
      );

      if (response.success && response.studentId) {
        return {
          success: true,
          studentId: response.studentId,
          studentName: response.studentName,
          confidence: response.confidence,
        };
      }

      return { success: false };
    } catch (error) {
      console.error("Recognition error:", error);
      return { success: false };
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
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />

        {/* Status Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
          <Loader className="w-12 h-12 text-white animate-spin" />
        </div>
      </div>

      {/* Status Indicator */}
      <motion.div
        layout
        className={`p-4 rounded-lg flex items-start gap-3 ${
          status === "success"
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
            : status === "error"
            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
            : status === "scanning"
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
            : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
        }`}
      >
        <div className="mt-0.5">
          {status === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : status === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : status === "scanning" ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Camera className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="font-semibold">{message}</p>
          {status === "scanning" && (
            <p className="text-sm mt-1">Processing your face...</p>
          )}
        </div>
      </motion.div>

      {/* Instructions */}
      {!faceDetected && status === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-700 dark:text-blue-400 text-sm space-y-2"
        >
          <p className="font-semibold">📸 Face Detection Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Position your face clearly in the camera</li>
            <li>Ensure good lighting</li>
            <li>Look straight at the camera</li>
            <li>Keep your face centered in the frame</li>
          </ul>
        </motion.div>
      )}

      {/* Camera Not Loaded */}
      {!modelsLoaded && (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading face detection models...
          </p>
        </div>
      )}
    </motion.div>
  );
}
