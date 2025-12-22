import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

export async function uploadCommunityImage(imageBuffer, fileName, contentType, model, imageType = 'output') {
    try {
        const timestamp = Date.now();
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Create path similar to existing structure: community/model/timestamp-type-filename
        const imagePath = `community/${model}/${timestamp}-${imageType}-${cleanFileName}`;

        // Upload to R2 (just store, don't generate URL yet)
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: imagePath,
            Body: imageBuffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Return only the path (not URL)
        return {
            path: imagePath,
            success: true
        };
    } catch (error) {
        console.error("Error uploading community image:", error);
        throw error;
    }
}

// Helper function to convert image URL/base64 to buffer
export async function imageUrlToBuffer(imageUrl) {
    if (imageUrl.startsWith('data:')) {
        // Base64 image
        const base64Data = imageUrl.replace(/^data:image\/[a-z]+;base64,/, '');
        return Buffer.from(base64Data, 'base64');
    } else {
        // URL image - fetch and convert
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
}

// Generate a safe filename from prompt or title
export function generateSafeFileName(text, fallback = 'image') {
    if (!text || typeof text !== 'string') {
        return fallback;
    }
    
    return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 30) // Limit length
        || fallback;
} 