import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { handleImagePublish } from "../../../lib/publishImageHandler";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const {
            outputImage,
            inputImages,
            model,
            title,
            prompt,
            modelParams,
            aspectRatio
        } = req.body;

        // Validate required fields
        if (!outputImage) {
            return res.status(400).json({ error: 'Output image is required' });
        }

        if (!model) {
            return res.status(400).json({ error: 'Model type is required' });
        }

   
        const publishedImage = await handleImagePublish({
            outputImage,
            inputImages: inputImages || [],
            model,
            userId: session.user.id,
            userName: session.user.name,
            userEmail: session.user.email,
            title,
            prompt,
            modelParams,
            aspectRatio
        });

        res.status(200).json({ 
            success: true, 
            image: {
                id: publishedImage.id,
                title: publishedImage.title,
                model: publishedImage.model,
                createdAt: publishedImage.createdAt
            }
        });
    } catch (error) {
        console.error('Publish error:', error);
        res.status(500).json({ 
            error: 'Failed to publish image',
            details: error.message 
        });
    }
} 