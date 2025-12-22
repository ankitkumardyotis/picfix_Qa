import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { getUserPlan } from './userData.js';

// Premium plans that get watermark-free downloads
const PREMIUM_PLANS = ['standard', 'premium', 'popular'];

/**
 * Check if user has a premium plan that allows watermark-free downloads
 * @param {string} userId - User ID
 * @returns {boolean} - True if user has premium plan
 */
export async function hasPremiumPlan(userId) {
  try {
    if (!userId) {
      console.log('hasPremiumPlan: No userId provided');
      return false;
    }

    console.log('hasPremiumPlan: Checking plans for userId:', userId);
    const plans = await getUserPlan(userId);
    console.log('hasPremiumPlan: Retrieved plans:', plans);
    
    if (!plans || plans.length === 0) {
      console.log('hasPremiumPlan: No plans found for user');
      return false;
    }

    // Check if any active plan is premium
    const hasPremium = plans.some(plan => {
      const isExpired = plan.expiredAt && new Date(plan.expiredAt) < new Date();
      
      // Clean the plan name by removing quotes and converting to lowercase
      const cleanPlanName = plan.planName?.replace(/['"]/g, '').toLowerCase();
      const isPremiumPlan = PREMIUM_PLANS.includes(cleanPlanName);
      
      console.log(`hasPremiumPlan: Plan ${plan.planName} -> Clean: "${cleanPlanName}" - Expired: ${isExpired}, Is Premium: ${isPremiumPlan}`);
      
      if (isExpired) return false;

      return isPremiumPlan;
    });

    console.log('hasPremiumPlan: Final result:', hasPremium);
    return hasPremium;
  } catch (error) {
    console.error('hasPremiumPlan: Error checking premium plan:', error);
    return false;
  }
}

/**
 * Apply watermark to image buffer
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} outputFormat - Output format (jpeg, png, etc.)
 * @returns {Buffer} - Watermarked image buffer
 */
export async function applyWatermark(imageBuffer, outputFormat = 'jpeg') {
  try {
    // Path to watermark image
    const watermarkPath = path.join(process.cwd(), 'public', 'assets', 'watermark.jpg');

    // Check if watermark file exists
    try {
      await fs.access(watermarkPath);
    } catch (error) {
      console.error('Watermark file not found:', watermarkPath);
      // Return original image if watermark is missing
      return imageBuffer;
    }

    // Get original image metadata
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Load and resize watermark (smaller for tiled pattern)
    const watermark = await sharp(watermarkPath)
      .resize({
        width: Math.floor(metadata.width * 0.15), // 15% of image width (smaller for tiling)
        height: Math.floor(metadata.height * 0.15), // 15% of image height
        fit: 'inside',
        withoutEnlargement: true
      })
      .png() // Convert to PNG for transparency support
      .toBuffer();

    // Get watermark metadata for proper positioning
    const watermarkMetadata = await sharp(watermark).metadata();

    // Create diagonal tiled watermark pattern
    const compositeArray = [];
    const spacing = Math.floor(Math.max(watermarkMetadata.width, watermarkMetadata.height) * 1.8); // Space between watermarks
    
    // Calculate how many watermarks we need to cover the image diagonally
    const maxDimension = Math.max(metadata.width, metadata.height);
    const numWatermarks = Math.ceil(maxDimension / spacing) + 3; // Extra to ensure full coverage

    // Create a grid of watermarks with diagonal offset
    for (let row = -2; row < numWatermarks; row++) {
      for (let col = -2; col < numWatermarks; col++) {
        const left = Math.floor(col * spacing);
        const top = Math.floor(row * spacing);
        
        // Only add watermark if it's within or near the image bounds
        if (left < metadata.width + watermarkMetadata.width && 
            top < metadata.height + watermarkMetadata.height &&
            left > -watermarkMetadata.width &&
            top > -watermarkMetadata.height) {
          compositeArray.push({
            input: watermark,
            top: top,
            left: left,
            blend: 'over',
          });
        }
      }
    }

    const watermarkedBuffer = await image
      .composite(compositeArray)
      .jpeg({ quality: 100 }) 
      .toBuffer();

    return watermarkedBuffer;
  } catch (error) {
    console.error('Error applying watermark:', error);
    // Return original image if watermarking fails
    return imageBuffer;
  }
}

/**
 * Process image for download with optional watermark
 * @param {string} imageUrl - URL of the image to download
 * @param {string} userId - User ID (optional)
 * @returns {Buffer} - Processed image buffer
 */
export async function processImageForDownload(imageUrl, userId = null) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // Check if user has premium plan
    console.log('processImageForDownload: Checking premium status for userId:', userId);
    const isPremium = userId ? await hasPremiumPlan(userId) : false;
    console.log('processImageForDownload: User is premium:', isPremium);
    if (isPremium) {
      // Return original image for premium users
      return buffer;
    } else {
      // Apply watermark for free users
      return await applyWatermark(buffer);
    }
  } catch (error) {
    console.error('Error processing image for download:', error);
    throw error;
  }
}
