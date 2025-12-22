import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import Replicate from "replicate";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { jobId, replicateId } = req.query;

  if (!jobId && !replicateId) {
    return res.status(400).json({ 
      error: 'Missing parameter',
      message: 'Either jobId or replicateId is required'
    });
  }

  try {
    let videoJob;

    // Find the video job
    if (jobId) {
      videoJob = await prisma.videoJob.findFirst({
        where: {
          id: jobId,
          userId: session.user.id
        }
      });
    } else {
      videoJob = await prisma.videoJob.findFirst({
        where: {
          replicateId: replicateId,
          userId: session.user.id
        }
      });
    }

    if (!videoJob) {
      return res.status(404).json({
        error: 'Job not found',
        message: 'Video generation job not found or access denied.'
      });
    }

    // If job is already completed, return the stored result
    if (videoJob.status === 'succeeded' && videoJob.publicUrl) {
      return res.status(200).json({
        jobId: videoJob.id,
        replicateId: videoJob.replicateId,
        status: 'succeeded',
        videoUrl: videoJob.publicUrl,
        prompt: videoJob.prompt,
        duration: videoJob.duration,
        aspectRatio: videoJob.aspectRatio,
        model: videoJob.model,
        completedAt: videoJob.completedAt,
        createdAt: videoJob.createdAt
      });
    }

    if (videoJob.status === 'failed') {
      return res.status(200).json({
        jobId: videoJob.id,
        replicateId: videoJob.replicateId,
        status: 'failed',
        errorMessage: videoJob.errorMessage || 'Video generation failed',
        prompt: videoJob.prompt,
        createdAt: videoJob.createdAt
      });
    }

    // If job is still running, check Replicate status
    if (videoJob.status === 'running') {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_KEY,
      });

      try {
        const prediction = await replicate.predictions.get(videoJob.replicateId);
        
        // In development (no webhook), handle completion directly
        if (prediction.status === 'succeeded' && prediction.output) {
          // Import the storage function
          const { storeGeneratedVideo } = await import('@/lib/unifiedImageStorage');
          
          try {
            // Store the video directly since no webhook will handle it
            const result = await storeGeneratedVideo({
              videoData: prediction.output,
              userId: videoJob.userId,
              model: videoJob.model,
              prompt: videoJob.prompt,
              duration: videoJob.duration,
              aspectRatio: videoJob.aspectRatio,
              startImage: videoJob.startImage,
              replicateId: videoJob.replicateId
            });

            return res.status(200).json({
              jobId: videoJob.id,
              replicateId: videoJob.replicateId,
              status: 'succeeded',
              videoUrl: result.publicUrl,
              prompt: videoJob.prompt,
              duration: videoJob.duration,
              aspectRatio: videoJob.aspectRatio,
              model: videoJob.model,
              completedAt: new Date().toISOString(),
              createdAt: videoJob.createdAt
            });

          } catch (storageError) {
            console.error('Error storing video in status check:', storageError);
            
            // Mark job as failed
            await prisma.videoJob.update({
              where: { id: videoJob.id },
              data: {
                status: 'failed',
                errorMessage: 'Failed to store video: ' + storageError.message
              }
            });

            return res.status(200).json({
              jobId: videoJob.id,
              replicateId: videoJob.replicateId,
              status: 'failed',
              errorMessage: 'Failed to store video: ' + storageError.message,
              prompt: videoJob.prompt,
              createdAt: videoJob.createdAt
            });
          }
        }

        if (prediction.status === 'failed') {
          // Update job as failed and refund credits
          await prisma.videoJob.update({
            where: { id: videoJob.id },
            data: {
              status: 'failed',
              errorMessage: prediction.error || 'Video generation failed'
            }
          });

          // Refund credits for failed generation
          await refundCreditsForFailedJob(videoJob.userId, videoJob.creditsDeducted);

          return res.status(200).json({
            jobId: videoJob.id,
            replicateId: videoJob.replicateId,
            status: 'failed',
            errorMessage: prediction.error || 'Video generation failed',
            prompt: videoJob.prompt,
            createdAt: videoJob.createdAt
          });
        }

        // Still running
        return res.status(200).json({
          jobId: videoJob.id,
          replicateId: videoJob.replicateId,
          status: 'running',
          progress: getProgressMessage(prediction),
          prompt: videoJob.prompt,
          createdAt: videoJob.createdAt,
          estimatedTimeRemaining: getEstimatedTime(videoJob.createdAt)
        });

      } catch (replicateError) {
        console.error('Error checking Replicate status:', replicateError);
        
        // Return current job status if Replicate check fails
        return res.status(200).json({
          jobId: videoJob.id,
          replicateId: videoJob.replicateId,
          status: videoJob.status,
          prompt: videoJob.prompt,
          createdAt: videoJob.createdAt
        });
      }
    }

    // Default response
    return res.status(200).json({
      jobId: videoJob.id,
      replicateId: videoJob.replicateId,
      status: videoJob.status,
      prompt: videoJob.prompt,
      createdAt: videoJob.createdAt
    });

  } catch (error) {
    console.error('Error checking video status:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: 'Failed to check video generation status'
    });
  }
}

/**
 * Get progress message based on Replicate prediction status
 */
function getProgressMessage(prediction) {
  if (prediction.status === 'starting') {
    return 'Initializing video generation...';
  }
  if (prediction.status === 'processing') {
    return 'Generating video... This may take a few minutes.';
  }
  if (prediction.status === 'succeeded') {
    return 'Finalizing video...';
  }
  return 'Processing...';
}

/**
 * Get estimated time remaining based on job creation time
 */
function getEstimatedTime(createdAt) {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const elapsedMinutes = Math.floor(elapsed / 60000);
  
  // Most video generations take 2-5 minutes
  if (elapsedMinutes < 2) {
    return '3-4 minutes';
  } else if (elapsedMinutes < 4) {
    return '1-2 minutes';
  } else {
    return 'Almost done...';
  }
}

/**
 * Refund credits for failed video generation
 */
async function refundCreditsForFailedJob(userId, creditsToRefund) {
  try {
    // Find user's purchased plan (not free plan)
    const plan = await prisma.plan.findFirst({
      where: {
        userId: userId,
        planName: { not: "free" }
      }
    });

    if (plan) {
      await prisma.plan.update({
        where: {
          id: plan.id,
          userId: userId,
        },
        data: {
          remainingPoints: {
            increment: creditsToRefund
          }
        },
      });

      console.log(`Refunded ${creditsToRefund} credits to user ${userId}`);
    }
  } catch (error) {
    console.error('Error refunding credits:', error);
  }
}