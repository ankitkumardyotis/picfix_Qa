import prisma from "@/lib/prisma";
import { generatePublicUrl } from "@/lib/publicUrlUtils";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { model, page = 1, limit = 20, sortBy = 'createdAt' } = req.body;

        if (!model) {
            return res.status(400).json({ error: 'Model type is required' });
        }


        // Fetch community images from database (paths only)
        const communityImages = await prisma.publishedImage.findMany({
            where: {
                model: model,
                isPublic: true,
                isApproved: true
            },
            orderBy: { [sortBy]: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            include: {
                user: {
                    select: { name: true, image: true }
                }
            }
        });


        // Generate public URLs for all images (instant loading)
        const processedImages = communityImages.map((dbImage, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325, 250, 300];
            
            try {
                // Generate public URL for output image (instant, no API calls)
                const outputUrl = generatePublicUrl(dbImage.outputImagePath);
                
                // Generate public URLs for input images
                const inputUrls = [];
                for (const inputImg of dbImage.inputImagePaths) {
                    if (inputImg.path) {
                        const inputUrl = generatePublicUrl(inputImg.path);
                        if (inputUrl) {
                            inputUrls.push({
                                ...inputImg,
                                url: inputUrl
                            });
                        }
                    }
                }
                
                const baseResult = {
                    id: `community-${dbImage.id}`,
                    url: outputUrl,
                    outputUrl: outputUrl,
                    inputUrls: inputUrls,
                    inputUrl: inputUrls[0]?.url || null, // For backward compatibility
                    title: dbImage.title,
                    prompt: dbImage.prompt,
                    height: height[idx % height.length],
                    isCommunity: true,
                    author: dbImage.user?.name,
                    authorImage: dbImage.user?.image,
                    likes: dbImage.likes,
                    downloads: dbImage.downloads,
                    views: dbImage.views,
                    hasComparison: inputUrls.length > 0,
                    modelParams: dbImage.modelParams,
                    aspectRatio: dbImage.aspectRatio,
                    createdAt: dbImage.createdAt,
                    publishedImageId: dbImage.id
                };

                // Special handling for combine-image model
                if (dbImage.model === 'combine-image' && inputUrls.length >= 2) {
                    baseResult.inputImage1 = inputUrls[0]?.url;
                    baseResult.inputImage2 = inputUrls[1]?.url;
                    baseResult.outputImage = outputUrl;
                }

                return baseResult;
            } catch (error) {
                console.error(`Error processing community image ${dbImage.id}:`, error);
                return null; // Skip this image if URL generation fails
            }
        });
        
        // Filter out any null images (failed to process)
        const validImages = processedImages.filter(img => img !== null);
        
        res.status(200).json({
            success: true,
            images: validImages,
            total: communityImages.length,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Error getting community images:', error);
        res.status(500).json({
            error: 'Failed to get community images',
            details: error.message
        });
    }
} 