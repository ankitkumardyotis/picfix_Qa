import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { getUserPlan } from "@/lib/userData";
import { canUseService, incrementUsage } from "@/lib/dailyUsage";
import { getRequestLocation } from "@/lib/locationUtils";
import Replicate from "replicate";
import prisma from "@/lib/prisma";
import modelConfigurations from "@/constant/ModelConfigurations";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Helper function to increment daily usage and handle errors gracefully
 * @param {string} email - User email
 * @param {number} creditsUsed - Number of credits used
 */
async function incrementDailyUsage(email, creditsUsed = 1) {
  try {
    await incrementUsage(email, creditsUsed);
  } catch (usageError) {
    console.error('Error incrementing daily usage:', usageError);
    // Don't fail the request if usage tracking fails
  }
}

/**
 * Deduct credits from user's purchased plan (not daily credits)
 * @param {string} userId - User ID
 * @param {number} credits - Credits to deduct
 */
async function deductPurchasedCredits(userId, credits) {
  try {
    // Find user's purchased plan (not free plan)
    const plan = await prisma.plan.findFirst({
      where: {
        userId: userId,
        planName: { not: "free" }, // Only deduct from purchased plans
        remainingPoints: { gt: 0 }
      }
    });

    if (!plan) {
      throw new Error("No purchased credits available");
    }

    // Deduct credits
    await prisma.plan.update({
      where: {
        id: plan.id,
        userId: userId,
      },
      data: {
        remainingPoints: {
          decrement: credits
        }
      },
    });

    return { success: true, remainingCredits: plan.remainingPoints - credits };
  } catch (error) {
    console.error('Error deducting purchased credits:', error);
    throw error;
  }
}

/**
 * Refund credits to user's purchased plan
 * @param {string} userId - User ID
 * @param {number} credits - Credits to refund
 */
async function refundPurchasedCredits(userId, credits) {
  try {
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
            increment: credits
          }
        },
      });
    }
  } catch (error) {
    console.error('Error refunding purchased credits:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please login to use this feature."
    });
  }

  const { 
    prompt, 
    duration = 5, 
    aspectRatio = "16:9", 
    startImage = "",
    model = "kling-v2.5-turbo-pro"
  } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Missing required fields",
      message: "Prompt is required for video generation."
    });
  }

  // Capture user location data
  let locationData = null;
  try {
    locationData = await getRequestLocation(req);
  } catch (error) {
    console.error('Error capturing location data:', error);
  }

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  // Get video generation cost (10 credits)
  const videoCost = modelConfigurations['generate-video']?.creditCost || 10;

  // Check user's plan and credits
  const planData = await getUserPlan(session.user.id);
  const hasPlan = planData && planData.length > 0 && planData[0];
  const hasPurchasedPlan = hasPlan && planData.some(item => item.name !== "free");
  const hasPurchasedCredits = hasPurchasedPlan && planData.find(item => item.name !== "free")?.remainingPoints >= videoCost;

  // Video generation requires purchased credits (not daily credits)
  if (!hasPurchasedCredits) {
    return res.status(402).json({
      error: "Insufficient purchased credits",
      message: `Video generation requires ${videoCost} purchased credits. Please upgrade your plan to continue.`
    });
  }

  try {
    // 1. Deduct credits immediately when starting generation
    await deductPurchasedCredits(session.user.id, videoCost);

    // 2. Get the correct model provider
    const videoModels = modelConfigurations['generate-video'].models;
    const selectedModel = videoModels.find(m => m.id === model);
    
    if (!selectedModel) {
      // Refund credits if model not found
      await refundPurchasedCredits(session.user.id, videoCost);
      return res.status(400).json({
        error: "Invalid model",
        message: "Selected video model is not supported."
      });
    }

    // 3. Prepare input for Replicate
    const input = {
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      start_image: startImage
    };

    // 4. Create webhook URL for completion notification (only for production)
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
    let webhookUrl = `${process.env.NGROK_WEBHOOK_URL}/api/video/webhook`;
    
    // // Only use webhook in production with HTTPS
    // if (baseUrl && (baseUrl.startsWith('https://') || process.env.NODE_ENV === 'production')) {
    //   webhookUrl = `${baseUrl}/api/video/webhook`;
    // }

    // 5. Start video generation
    const predictionConfig = {
      model: selectedModel.provider,
      input
    };

    // Add webhook only if we have a valid HTTPS URL
    if (webhookUrl) {
      predictionConfig.webhook = webhookUrl;
      predictionConfig.webhook_events_filter = ["completed"];
    }
    console.log('predictionConfig', predictionConfig);

    const prediction = await replicate.predictions.create(predictionConfig);
    console.log('prediction--------------------------------', prediction);

    // // 6. Create VideoJob record to track the generation
    const videoJob = await prisma.videoJob.create({
      data: {
        userId: session.user.id,
        replicateId: prediction.id,
        model,
        prompt,
        duration,
        aspectRatio,
        startImage: startImage || null,
        status: 'running',
        creditsDeducted: videoCost,
        userIP: locationData?.ip || null,
        country: locationData?.country || null,
        region: locationData?.region || null,
        city: locationData?.city || null,
      }
    });

    res.status(200).json({
      success: true,
      jobId: videoJob.id,
      replicateId: prediction.id,
      status: 'running',
      message: webhookUrl 
        ? 'Video generation started successfully. You will be notified when it completes.'
        : 'Video generation started successfully. Use the "Check Status" button to monitor progress.',
      estimatedTime: '2-5 minutes',
      hasWebhook: !!webhookUrl
    });
    res.status(200).json({
      success: true,
      message: 'Video generation started successfully.'
    });

  } catch (error) {
    console.error('Error starting video generation:', error);
    
    // Refund credits if generation failed to start
    try {
      await refundPurchasedCredits(session.user.id, videoCost);
    } catch (refundError) {
      console.error('Error refunding credits:', refundError);
    }

    // Extract meaningful error messages
    let errorMessage = "Failed to start video generation. Please try again.";
    let errorType = "Generation Error";
    
    if (error.message) {
      if (error.message.includes("Content flagged")) {
        errorType = "Content Policy Violation";
        errorMessage = "Your prompt was flagged for inappropriate content. Please modify your prompt and try again.";
      } else if (error.message.includes("insufficient funds") || error.message.includes("quota")) {
        errorType = "Service Quota Error";
        errorMessage = "Service quota exceeded. Please try again later.";
      } else if (error.message.includes("No purchased credits available")) {
        errorType = "Insufficient Credits";
        errorMessage = `Video generation requires ${videoCost} purchased credits. Please upgrade your plan.`;
      } else {
        errorMessage = error.message;
      }
    }
    
    res.status(500).json({
      error: errorType,
      message: errorMessage
    });
  }
}