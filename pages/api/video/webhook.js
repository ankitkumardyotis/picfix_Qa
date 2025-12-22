import prisma from "@/lib/prisma";
import { storeGeneratedVideo } from "@/lib/unifiedImageStorage";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;
    console.log('Video webhook received:', JSON.stringify(webhookData, null, 2));

    if (!webhookData.id) {
      console.error('No prediction ID in webhook data');
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Find the video job
    const videoJob = await prisma.videoJob.findUnique({
      where: { replicateId: webhookData.id }
    });

    if (!videoJob) {
      console.error(`Video job not found for replicateId: ${webhookData.id}`);
      return res.status(404).json({ error: 'Video job not found' });
    }

    // Prevent duplicate processing
    if (videoJob.webhookReceived) {
      console.log(`Webhook already processed for job: ${videoJob.id}`);
      return res.status(200).json({ message: 'Webhook already processed' });
    }

    // Mark webhook as received
    await prisma.videoJob.update({
      where: { id: videoJob.id },
      data: { webhookReceived: true }
    });

    if (webhookData.status === 'succeeded' && webhookData.output) {
      try {
        // Store the video in R2 and update job
        const result = await storeGeneratedVideo({
          videoData: webhookData.output,
          userId: videoJob.userId,
          model: videoJob.model,
          prompt: videoJob.prompt,
          duration: videoJob.duration,
          aspectRatio: videoJob.aspectRatio,
          startImage: videoJob.startImage,
          replicateId: webhookData.id
        });

        console.log(`Video successfully stored for job: ${videoJob.id}`);
        
        res.status(200).json({ 
          message: 'Video webhook processed successfully',
          jobId: videoJob.id,
          publicUrl: result.publicUrl
        });

      } catch (storageError) {
        console.error('Error storing video:', storageError);
        
        // Mark job as failed and refund credits
        await prisma.videoJob.update({
          where: { id: videoJob.id },
          data: {
            status: 'failed',
            errorMessage: 'Failed to store video: ' + storageError.message,
            webhookProcessed: true
          }
        });

        // Refund credits
        await refundCreditsForFailedJob(videoJob.userId, videoJob.creditsDeducted);

        res.status(500).json({ 
          error: 'Storage failed',
          message: 'Failed to store generated video'
        });
      }

    } else if (webhookData.status === 'failed') {
      // Mark job as failed and refund credits
      await prisma.videoJob.update({
        where: { id: videoJob.id },
        data: {
          status: 'failed',
          errorMessage: webhookData.error || 'Video generation failed',
          webhookProcessed: true
        }
      });

      // Refund credits for system/model failures
      await refundCreditsForFailedJob(videoJob.userId, videoJob.creditsDeducted);

      console.log(`Video generation failed for job: ${videoJob.id}, credits refunded`);
      
      res.status(200).json({ 
        message: 'Video generation failed, credits refunded',
        jobId: videoJob.id
      });

    } else {
      // Unexpected status
      console.log(`Unexpected webhook status: ${webhookData.status} for job: ${videoJob.id}`);
      
      res.status(200).json({ 
        message: 'Webhook received but not processed',
        status: webhookData.status
      });
    }

  } catch (error) { 
    console.error('Video webhook processing error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error.message 
    });
  }
}

/**
 * Refund credits for failed video generation
 * Only refunds for system/model failures, not user errors
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

      // Update the job to track refund
      await prisma.videoJob.updateMany({
        where: {
          userId: userId,
          creditsDeducted: creditsToRefund,
          creditsRefunded: 0
        },
        data: {
          creditsRefunded: creditsToRefund
        }
      });

      console.log(`Refunded ${creditsToRefund} credits to user ${userId}`);
    }
  } catch (error) {
    console.error('Error refunding credits:', error);
  }
}