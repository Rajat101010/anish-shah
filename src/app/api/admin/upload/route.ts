
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMAGE_LIMIT = Number(process.env.UPLOAD_MAX_IMAGE_MB || 8) * 1024 * 1024;
const VIDEO_LIMIT = Number(process.env.UPLOAD_MAX_VIDEO_MB || 50) * 1024 * 1024;

const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedVideos = ["video/mp4", "video/webm", "video/quicktime"];

function uploadBuffer(
  buffer: Buffer,
  resourceType: "image" | "video"
): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "barber-portfolio",
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed."));
            return;
          }
          resolve({ secure_url: result.secure_url });
        }
      )
      .end(buffer);
  });
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please select an image or video." },
        { status: 400 }
      );
    }

    const isImage = allowedImages.includes(file.type);
    const isVideo = allowedVideos.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Use JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV files." },
        { status: 400 }
      );
    }

    const limit = isImage ? IMAGE_LIMIT : VIDEO_LIMIT;

    if (file.size > limit) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size: ${Math.floor(limit / 1024 / 1024)} MB.`,
        },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, isImage ? "image" : "video");

    return NextResponse.json({
      mediaUrl: result.secure_url,
      mediaType: isImage ? "image" : "video",
    });
  } catch (error) {
    console.error("Media upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed. Check your Cloudinary configuration and try again." },
      { status: 500 }
    );
  }
}
