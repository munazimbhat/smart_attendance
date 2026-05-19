// @ts-nocheck
import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;

// Initialize face-api models
export async function initializeFaceDetectionModels() {
  if (modelsLoaded) return true;
  
  try {
    const MODEL_URL = "/models";
    
    console.log("[FaceAPI] Loading models from", MODEL_URL);
    
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    console.log("[FaceAPI] TinyFaceDetector loaded");
    
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    console.log("[FaceAPI] FaceLandmark68Net loaded");
    
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    console.log("[FaceAPI] FaceRecognitionNet loaded");
    
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    console.log("[FaceAPI] FaceExpressionNet loaded");
    
    modelsLoaded = true;
    console.log("[FaceAPI] All models loaded successfully!");
    return true;
  } catch (error) {
    console.error("[FaceAPI] Failed to load face detection models:", error);
    return false;
  }
}

// Detect faces in a canvas element
export async function detectFaces(
  input: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement
) {
  try {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.3,
    });

    const detections = await faceapi
      .detectAllFaces(input, options)
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();

    return detections;
  } catch (error) {
    console.error("[FaceAPI] Error detecting faces:", error);
    return [];
  }
}

// Extract face embeddings from detected faces
export function extractFaceEmbeddings(detections: any[]) {
  return detections.map((detection) => ({
    descriptor: detection.descriptor,
    detection: detection.detection,
    landmarks: detection.landmarks,
  }));
}

// Compare faces using L2 distance
export function compareFaces(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  if (!descriptor1 || !descriptor2) return Infinity;

  let distance = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    distance += diff * diff;
  }
  return Math.sqrt(distance);
}

// Match faces against enrolled users
export function matchFaceAgainstEnrolled(
  detectedDescriptor: Float32Array,
  enrolledDescriptors: Float32Array[]
): { matchIndex: number; distance: number } | null {
  if (!detectedDescriptor || !enrolledDescriptors.length) {
    return null;
  }

  let bestMatch = { matchIndex: -1, distance: Infinity };

  enrolledDescriptors.forEach((enrolled, index) => {
    const distance = compareFaces(detectedDescriptor, enrolled);
    if (distance < bestMatch.distance) {
      bestMatch = { matchIndex: index, distance };
    }
  });

  // Threshold for matching (0.6 is standard for face-api)
  if (bestMatch.distance < 0.6) {
    return bestMatch;
  }

  return null;
}

// Draw detection boxes on canvas
export function drawDetectionsOnCanvas(
  canvas: HTMLCanvasElement,
  detections: any[],
  labels: string[] = []
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!detections || detections.length === 0) return;

  const displaySize = {
    width: canvas.width,
    height: canvas.height,
  };

  try {
    faceapi.matchDimensions(canvas, displaySize);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    resizedDetections.forEach((detection: any, index: number) => {
      const box = detection.detection.box;

      // Draw green box
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw label
      const label = labels[index] || "Detected";
      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 16px Arial";
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
      ctx.fillRect(box.x, box.y - 24, textWidth + 10, 24);
      ctx.fillStyle = "#000000";
      ctx.fillText(label, box.x + 5, box.y - 6);
    });
  } catch (error) {
    // Silently handle drawing errors
  }
}

// Capture frame from video
export function captureVideoFrame(video: HTMLVideoElement): Blob | null {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.8);
  });
}

// Validate face quality
export function validateFaceQuality(
  detection: any
): { isValid: boolean; message: string } {
  const box = detection.detection.box;

  // Check face size (should be at least 50x50 pixels)
  if (box.width < 50 || box.height < 50) {
    return { isValid: false, message: "Face too small - move closer" };
  }

  return { isValid: true, message: "Face valid" };
}
