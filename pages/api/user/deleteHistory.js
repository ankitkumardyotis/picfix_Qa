import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import prisma from '@/lib/prisma';

// Configure R2 client for deletions
const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Delete image from R2 bucket
async function deleteFromR2(imagePath) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imagePath,
    });

    await r2Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error deleting from R2:', imagePath, error);
    // Don't throw error for R2 deletion failures - just log them
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { historyId } = req.body;
    
    if (!historyId) {
      return res.status(400).json({ error: 'History ID is required' });
    }


    // 1. First, fetch the history record to get file paths
    const historyRecord = await prisma.history.findUnique({
      where: { 
        id: historyId,
        userId: session.user.id // Ensure user owns this record
      },
      include: {
        publishedImage: true // Include published image info if it exists
      }
    });

 
    if (!historyRecord) {
      return res.status(404).json({ error: 'History record not found or access denied' });
    }

    // 2. Collect all image paths to delete from R2
    const imagesToDelete = [];
    
    // Add output image path
    if (historyRecord.outputImagePath) {
      imagesToDelete.push(historyRecord.outputImagePath);
    }
    
    // Add input image paths
    if (historyRecord.inputImagePaths && Array.isArray(historyRecord.inputImagePaths)) {
      historyRecord.inputImagePaths.forEach(input => {
        if (input.path) {
          imagesToDelete.push(input.path);
        }
      });
    }


    // 3. Delete published image if it exists (cascade deletion)
    let deletedPublishedImage = null;
    if (historyRecord.publishedImageId) {

      // Delete image likes first (foreign key constraint)
      await prisma.imageLike.deleteMany({
        where: {
          publishedImageId: historyRecord.publishedImageId
        }
      });
      
      // Delete the published image
      deletedPublishedImage = await prisma.publishedImage.delete({
        where: {
          id: historyRecord.publishedImageId
        }
      });
      
      console.log('✅ Successfully deleted published image:', deletedPublishedImage.id);
    }

    // 4. Delete all images from R2 bucket (in parallel)
    const deletionResults = await Promise.allSettled(
      imagesToDelete.map(imagePath => deleteFromR2(imagePath))
    );

    // Log deletion results
    deletionResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          console.log(`✅ Successfully deleted: ${imagesToDelete[index]}`);
        } else {
          console.log(`⚠️ Failed to delete from R2: ${imagesToDelete[index]} - ${result.value.error}`);
        }
      } else {
        console.log(`❌ Delete operation failed: ${imagesToDelete[index]} - ${result.reason}`);
      }
    });

    // 5. Delete the history record from database
    await prisma.history.delete({
      where: { 
        id: historyId,
        userId: session.user.id // Double-check ownership
      }
    });


    const successfulDeletions = deletionResults.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failedDeletions = deletionResults.length - successfulDeletions;

    res.status(200).json({
      success: true,
      message: 'History item deleted successfully',
      details: {
        historyId,
        totalFiles: imagesToDelete.length,
        successfulDeletions,
        failedDeletions,
        deletedFromDatabase: true,
        deletedPublishedImage: deletedPublishedImage ? deletedPublishedImage.id : null
      }
    });

  } catch (error) {
    console.error('Error deleting history:', error);
    
    res.status(500).json({ 
      error: 'Failed to delete history item',
      details: error.message 
    });
  }
} 