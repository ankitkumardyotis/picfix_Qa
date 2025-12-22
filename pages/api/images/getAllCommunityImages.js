import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { generatePublicUrl } from "@/lib/publicUrlUtils";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { page = 1, limit = 100, sortBy = 'createdAt' } = req.body;

        // Get user session to check like status
        const session = await getServerSession(req, res, authOptions);
        const currentUserId = session?.user?.id;

        // Fetch community images from ALL models in one database query
        const communityImages = await prisma.publishedImage.findMany({
            where: {
                isPublic: true,
                isApproved: true
            },
            orderBy: { [sortBy]: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit),
            include: {
                user: {
                    select: { name: true, image: true }
                },
                imageLikes: currentUserId ? {
                    where: { userId: currentUserId },
                    select: { userId: true }
                } : false
            }
        });


        // Generate public URLs for all images (instant loading)
        const processedImages = communityImages.map((dbImage, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325, 250, 300];

            try {
                const outputUrl = generatePublicUrl(dbImage.outputImagePath);
                
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
                    publishedImageId: dbImage.id,
                    model: dbImage.model, // Include model information
                    userLiked: currentUserId ? dbImage.imageLikes.length > 0 : false, // Check if current user liked this image
                    isLoggedIn: !!currentUserId // Whether user is logged in
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

        const validImages = processedImages.filter(img => img !== null);

        res.status(200).json({
            success: true,
            images: validImages,
            total: communityImages.length,
            page: parseInt(page),
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('Error getting all community images:', error);
        res.status(500).json({
            error: 'Failed to get all community images',
            details: error.message
        });
    }
} 