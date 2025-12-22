import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;


export async function uploadFile(fileName, contentType) {
    try {
        const key = `images/${Date.now()}-${fileName}`;

        // Generate a pre-signed URL for PUT operation
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour

        // Also generate a GET URL for accessing the file later
        const getUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            }),
            { expiresIn: 3600 } // 1 hour
        );

        return {
            uploadUrl,
            getUrl,
            key
        };
    } catch (error) {
        console.error("Error generating upload URL:", error);
        throw error;
    }
}


export async function uploadFileToR2(fileBuffer, fileName, contentType) {
    try {
        const key = `images/${Date.now()}-${fileName}`;

        // Upload the file to R2
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // Generate a signed URL for access (valid for 7 days)
        const url = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            }),
            { expiresIn: 3600 } // 1 hour in seconds
        );

        return {
            url,
            key
        };
    } catch (error) {
        console.error("Error uploading file to R2:", error);
        throw error;
    }
}


// export async function getSignedFileUrl(key) {
//     try {
//         const url = await getSignedUrl(
//             s3Client,
//             new GetObjectCommand({
//                 Bucket: BUCKET_NAME,
//                 Key: key,
//             }),
//             { expiresIn: 604800 } // 7 days in seconds
//         );
//         return url;
//     } catch (error) {
//         console.error("Error getting signed URL:", error);
//         throw error;
//     }
// }