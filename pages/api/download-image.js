import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { processImageForDownload } from '../../lib/watermarkUtils.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Get user session to check plan
    const session = await getServerSession(req, res, authOptions);
    const userId = session?.user?.id;

    // Process image with watermark logic
    const processedBuffer = await processImageForDownload(url, userId);

    // Set headers to force download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'image.jpg'}"`);
    res.setHeader('Content-Length', processedBuffer.length);

    // Send the processed image buffer
    res.send(processedBuffer);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download image' });
  }
} 