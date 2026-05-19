import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { embedding } = await request.json();

    if (!embedding) {
      return NextResponse.json(
        { error: "embedding is required" },
        { status: 400 }
      );
    }

    // Parse the incoming descriptor
    const inputDescriptor: number[] = JSON.parse(embedding);

    // Fetch all registered face embeddings
    const registrations = await prisma.faceRegistration.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (registrations.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No registered faces found",
      });
    }

    // Compare against all registered faces using Euclidean distance
    let bestMatch: {
      studentId: string;
      studentName: string;
      distance: number;
    } | null = null;

    for (const reg of registrations) {
      try {
        const storedDescriptor: number[] = JSON.parse(reg.embedding);

        // Calculate Euclidean distance
        let distance = 0;
        for (let i = 0; i < inputDescriptor.length && i < storedDescriptor.length; i++) {
          const diff = inputDescriptor[i] - storedDescriptor[i];
          distance += diff * diff;
        }
        distance = Math.sqrt(distance);

        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = {
            studentId: reg.user.id,
            studentName: `${reg.user.firstName} ${reg.user.lastName}`,
            distance,
          };
        }
      } catch (parseError) {
        console.error(`Failed to parse embedding for user ${reg.userId}:`, parseError);
        continue;
      }
    }

    // Threshold for face matching (0.6 is standard for face-api.js)
    const MATCH_THRESHOLD = 0.6;

    if (bestMatch && bestMatch.distance < MATCH_THRESHOLD) {
      const confidence = Math.max(0, Math.min(1, 1 - bestMatch.distance));
      return NextResponse.json({
        success: true,
        studentId: bestMatch.studentId,
        studentName: bestMatch.studentName,
        confidence,
        distance: bestMatch.distance,
      });
    }

    return NextResponse.json({
      success: false,
      message: "No matching face found",
      bestDistance: bestMatch?.distance,
    });
  } catch (error) {
    console.error("Face recognize error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
