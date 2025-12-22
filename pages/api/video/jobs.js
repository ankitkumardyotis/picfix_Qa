import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const whereClause = {
      userId: session.user.id
    };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    const videoJobs = await prisma.videoJob.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });
    
    // Transform data for frontend
    const transformedJobs = videoJobs.map(job => ({
      id: job.id,
      replicateId: job.replicateId,
      status: job.status,
      model: job.model,
      prompt: job.prompt,
      duration: job.duration,
      aspectRatio: job.aspectRatio,
      negativePrompt: job.negativePrompt,
      startImage: job.startImage,
      videoUrl: job.publicUrl,
      errorMessage: job.errorMessage,
      creditsDeducted: job.creditsDeducted,
      creditsRefunded: job.creditsRefunded,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      // Add progress info for running jobs
      ...(job.status === 'running' && {
        estimatedTimeRemaining: getEstimatedTime(job.createdAt),
        progress: getProgressForRunningJob(job.createdAt)
      })
    }));
    
    // Get total count for pagination
    const totalJobs = await prisma.videoJob.count({
      where: whereClause
    });
    
    res.status(200).json({
      success: true,
      jobs: transformedJobs,
      pagination: {
        total: totalJobs,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalJobs / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching video jobs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch video jobs',
      message: error.message 
    });
  }
}

/**
 * Get estimated time remaining for running jobs
 */
function getEstimatedTime(createdAt) {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const elapsedMinutes = Math.floor(elapsed / 60000);
  
  if (elapsedMinutes < 2) {
    return '3-4 minutes';
  } else if (elapsedMinutes < 4) {
    return '1-2 minutes';
  } else {
    return 'Almost done...';
  }
}

/**
 * Get progress message for running jobs
 */
function getProgressForRunningJob(createdAt) {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const elapsedMinutes = Math.floor(elapsed / 60000);
  
  if (elapsedMinutes < 1) {
    return 'Initializing video generation...';
  } else if (elapsedMinutes < 3) {
    return 'Generating video... This may take a few minutes.';
  } else {
    return 'Finalizing video...';
  }
}