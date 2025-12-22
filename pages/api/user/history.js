import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { generatePublicUrl } from "@/lib/unifiedImageStorage";
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { model, page = 1, limit = 20, includeVideos = 'false' } = req.query;
    
    const whereClause = {
      userId: session.user.id,
      status: 'completed',
      outputImagePath: { not: null } // Only show records with images
    };
    
    if (model && model !== 'all') {
      // Handle both old and new model names for re-imagine
      if (model === 're-imagine') {
        whereClause.model = { in: ['re-imagine', 'reimagine'] };
      } else if (model === 'generate-image') {
        // Handle all generate-image model variants
        whereClause.model = { 
          in: ['generate-image', 'generate-image-qwen', 'generate-image-gemini', 'generate-image-flux', 'generate-image-pruna', 'generate-image-seedream'] 
        };
      } else if (model === 'edit-image') {
        // Handle all edit-image model variants
        whereClause.model = { 
          in: ['edit-image-qwen', 'edit-image-flux', 'edit-image-pruna', 'edit-image-nano', 'edit-image-seedream'] 
        };
      } else if (model === 'upscale-image') {
        // Handle all upscale-image model variants
        whereClause.model = { 
          in: ['upscale-image-crystal', 'upscale-image-topaz', 'upscale-image-google', 'upscale-image-seedvr2'] 
        };
      } else if (model === 'restore-image') {
        // Handle all restore-image model variants
        whereClause.model = { 
          in: ['restore-image', 'restore-image-flux', 'restore-image-topaz', 'restore-image-google', 'restore-image-crystal'] 
        };
      } else {
        whereClause.model = model;
      }
    }
    
    const history = await prisma.history.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        publishedImage: {
          select: { id: true, title: true, likes: true }
        }
      }
    });
    

    // Transform data for frontend
    const transformedHistory = history.map(record => {
      const baseRecord = {
        id: record.id,
        url: record.publicUrl || generatePublicUrl(record.outputImagePath), // Use stored public URL or generate
        model: record.model,
        prompt: record.prompt,
        modelParams: record.modelParams,
        aspectRatio: record.aspectRatio,
        isPublished: record.isPublished,
        publishedData: record.publishedImage,
        createdAt: record.createdAt,
        // Include input images for comparison
        inputImages: record.inputImagePaths?.map(input => ({
          ...input,
          // Generate public URL for input images
          url: generatePublicUrl(input.path)
        })) || [],
        hasComparison: record.inputImagePaths && record.inputImagePaths.length > 0
      };

      // Special handling for combine-image model
      if (record.model === 'combine-image' && record.inputImagePaths && record.inputImagePaths.length >= 2) {
        baseRecord.inputImage1 = generatePublicUrl(record.inputImagePaths[0].path);
        baseRecord.inputImage2 = generatePublicUrl(record.inputImagePaths[1].path);
        baseRecord.outputImage = baseRecord.url;
      }

      return baseRecord;
    });
    
    let response = {
      success: true,
      history: transformedHistory,
      total: history.length,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    // Include video jobs if requested
    if (includeVideos === 'true') {
      const videoJobs = await prisma.videoJob.findMany({
        where: {
          userId: session.user.id,
          ...(model && model !== 'all' && model === 'generate-video' ? {} : { status: 'succeeded' })
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit)
      });

      const transformedVideoJobs = videoJobs.map(job => ({
        id: `video_${job.id}`,
        type: 'video',
        url: job.publicUrl,
        model: 'generate-video',
        subModel: job.model,
        prompt: job.prompt,
        status: job.status,
        duration: job.duration,
        aspectRatio: job.aspectRatio,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        errorMessage: job.errorMessage,
        isVideo: true
      }));

      response.videoJobs = transformedVideoJobs;
    }
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
} 