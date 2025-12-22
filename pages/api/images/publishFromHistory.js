import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { publishFromHistory } from '@/lib/unifiedImageStorage';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { historyId, title, description } = req.body;
    
    if (!historyId) {
      return res.status(400).json({ error: 'History ID is required' });
    }
    

    const publishedImage = await publishFromHistory(historyId, {
      title: title || null,
      description: description || null
    });
    
    res.status(200).json({
      success: true,
      publishedImage: {
        id: publishedImage.id,
        title: publishedImage.title,
        model: publishedImage.model,
        createdAt: publishedImage.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error publishing from history:', error);
    
    // Return specific error messages
    if (error.message === 'History record not found') {
      return res.status(404).json({ error: 'Image not found in history' });
    }
    
    if (error.message === 'Image already published') {
      return res.status(400).json({ error: 'Image has already been published' });
    }
    
    res.status(500).json({ error: 'Failed to publish image' });
  }
} 