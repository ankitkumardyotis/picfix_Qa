import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import { getUseCaseImageUrl } from "@/constant/getUseCaseImageUrl";
import { generatePublicUrl, getModelDisplayName as getModelName } from "@/lib/publicUrlUtils";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { page = 1, limit = 50, sortBy = 'createdAt' } = req.body;

        // Get user session to check like status
        const session = await getServerSession(req, res, authOptions);
        const currentUserId = session?.user?.id;


        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        
        // Get total count for community images
        const totalCommunityImages = await prisma.publishedImage.count({
            where: {
                isPublic: true,
                isApproved: true
            }
        });

        // 1. Fetch community images with pagination (optimized query)
        const communityImages = await prisma.publishedImage.findMany({
            where: {
                isPublic: true,
                isApproved: true
            },
            orderBy: { [sortBy]: 'desc' },
            skip: Math.floor(skip / 2), // Split pagination between community and examples
            take: Math.ceil(take / 2), // Take half the limit for community images
            select: {
                id: true,
                title: true,
                prompt: true,
                outputImagePath: true,
                inputImagePaths: true,
                likes: true,
                downloads: true,
                views: true,
                modelParams: true,
                aspectRatio: true,
                createdAt: true,
                model: true,
                user: {
                    select: { name: true, image: true }
                },
                imageLikes: currentUserId ? {
                    where: { userId: currentUserId, publishedImageId: { not: null } },
                    select: { userId: true }
                } : false
            }
        });

                         // 2. Get total count of example images first (for pagination calculation)
        let totalExampleImages = 0;
        for (const modelData of getUseCaseImageUrl) {
            totalExampleImages += modelData.useCaseImages.length;
        }
        
       
        // 3. Efficiently paginate example images without loading all
        const exampleSkip = Math.ceil(skip / 2);
        const exampleTake = Math.floor(take / 2);
        
        // Get all example image IDs with their basic info for sorting
        const allExampleImageIds = [];
        for (const modelData of getUseCaseImageUrl) {
            const model = modelData.model;
            const modelKey = model === 're-imagine' ? 'reimagine' : model;

            for (const imageData of modelData.useCaseImages) {
                const exampleImageId = `${modelKey}::${imageData.outputImage}`;
                allExampleImageIds.push({
                    id: exampleImageId,
                    model: modelKey,
                    imageData: imageData,
                    exampleImageId: exampleImageId,
                    isExample: true
                });
            }
        }
        
        // Get stats for all example images in one query (optimized)
        const allExampleStats = await prisma.exampleImageStats.findMany({
            where: {
                imageId: {
                    in: allExampleImageIds.map(img => img.exampleImageId)
                }
            },
            select: {
                imageId: true,
                likes: true,
                downloads: true,
                views: true,
                createdAt: true
            }
        });
        
        // Get user likes for all example images in one query (if user is logged in)
        let userExampleLikes = [];
        if (currentUserId) {
            userExampleLikes = await prisma.imageLike.findMany({
                where: {
                    userId: currentUserId,
                    exampleImageId: {
                        in: allExampleImageIds.map(img => img.exampleImageId)
                    }
                },
                select: { exampleImageId: true }
            });
        }
        
        // Create a map for quick lookups
        const statsMap = new Map(allExampleStats.map(stat => [stat.imageId, stat]));
        const likesMap = new Map(userExampleLikes.map(like => [like.exampleImageId, true]));
        
        // Add stats to example images and sort by likes
        const allExampleImages = allExampleImageIds.map(img => {
            const stats = statsMap.get(img.exampleImageId);
            return {
                ...img,
                id: `example-${img.exampleImageId}`,
                likes: stats?.likes || 0,
                downloads: stats?.downloads || 0,
                views: stats?.views || 0,
                userLiked: likesMap.has(img.exampleImageId),
                createdAt: stats?.createdAt || new Date('2024-01-01')
            };
        });
        
        // Sort by likes and apply pagination
        allExampleImages.sort((a, b) => b.likes - a.likes);
        const selectedExampleImages = allExampleImages.slice(exampleSkip, exampleSkip + exampleTake);
        
       

        // 4. Process community images with public URLs (instant loading)
        const processedCommunityImages = communityImages.map((dbImage, idx) => {
            const height = [300, 250, 275, 225, 325, 250, 300, 275, 250, 325];
            
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
                        title: dbImage.title,
                        prompt: dbImage.prompt,
                        height: height[idx % height.length],
                        isCommunity: true,
                        isExample: false,
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
                        model: dbImage.model,
                        userLiked: currentUserId ? dbImage.imageLikes.length > 0 : false,
                        isLoggedIn: !!currentUserId
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
                return null;
            }
        });

        // 5. Process example images with public URLs (instant loading)
       
        const processedExampleImages = selectedExampleImages.map((exampleImg, idx) => {
            try {
                const height = [280, 260, 290, 240, 310, 270, 320, 250, 300, 330];
                const model = exampleImg.model;
                const imageData = exampleImg.imageData;
                
               
                
                // Generate public URLs for example images (instant, no API calls)
                const outputUrl = generatePublicUrl(`picfix-usecase-image/${model}/${imageData.outputImage}`);
                
                let inputUrl = null;
                if (imageData.imagePath) {
                    inputUrl = generatePublicUrl(`picfix-usecase-image/${model}/${imageData.imagePath}`);
                }

                // Handle combine-image specific properties
                let inputImage1Url = null;
                let inputImage2Url = null;
                if (model === 'combine-image') {
                    if (imageData.inputImage1) {
                        inputImage1Url = generatePublicUrl(`picfix-usecase-image/${model}/${imageData.inputImage1}`);
                    }
                    if (imageData.inputImage2) {
                        inputImage2Url = generatePublicUrl(`picfix-usecase-image/${model}/${imageData.inputImage2}`);
                    }
                }

                // Create prompt from image name for text-based models
                let prompt = null;
                if (['generate-image', 'combine-image'].includes(model)) {
                    prompt = imageData.outputImage.replace(/\.(jpg|png|jpeg)$/i, '');
                }

                const processedImage = {
                    id: exampleImg.id,
                    url: outputUrl,
                    outputUrl: outputUrl,
                    inputUrl: inputUrl,
                    title: `${getModelName(model)} Example`,
                    prompt: prompt,
                    height: height[idx % height.length],
                    isCommunity: false,
                    isExample: true,
                    author: 'PicFix.AI',
                    authorImage: null,
                    likes: exampleImg.likes,
                    downloads: exampleImg.downloads,
                    views: exampleImg.views,
                    hasComparison: !!inputUrl,
                    modelParams: null,
                    aspectRatio: null,
                    createdAt: exampleImg.createdAt,
                    exampleImageId: exampleImg.exampleImageId,
                    model: model,
                    userLiked: exampleImg.userLiked,
                    isLoggedIn: !!currentUserId,
                    // Add combine-image specific properties
                    inputImage1: inputImage1Url,
                    inputImage2: inputImage2Url
                };
                
               
                return processedImage;
            } catch (error) {
                console.error(`Error processing example image ${idx + 1}:`, error, {
                    model: exampleImg.model,
                    imageData: exampleImg.imageData
                });
                return null;
            }
        });
         
         const validExampleImages = processedExampleImages.filter(img => img !== null);
        

        // 6. Combine and shuffle both types
        const allImages = [
            ...processedCommunityImages.filter(img => img !== null),
            ...processedExampleImages.filter(img => img !== null)
        ];

        // Sort by creation date (newest first) but mix community and example images
        allImages.sort((a, b) => {
            // Prioritize community images slightly, then by likes, then by date
            if (a.isCommunity !== b.isCommunity) {
                return a.isCommunity ? -0.1 : 0.1; // Slight preference for community
            }
            if (a.likes !== b.likes) {
                return b.likes - a.likes; // Higher likes first
            }
            return new Date(b.createdAt) - new Date(a.createdAt); // Newer first
        });

        const validCommunityCount = processedCommunityImages.filter(img => img !== null).length;
        const validExampleCount = processedExampleImages.filter(img => img !== null).length;
        
        // Calculate totals and pagination info
        const grandTotal = totalCommunityImages + totalExampleImages;
        const currentTotal = skip + allImages.length;
        const hasMore = currentTotal < grandTotal;
        

        res.status(200).json({
            success: true,
            images: allImages,
            total: grandTotal,
            currentCount: allImages.length,
            communityCount: validCommunityCount,
            exampleCount: validExampleCount,
            totalCommunityCount: totalCommunityImages,
            totalExampleCount: totalExampleImages,
            page: parseInt(page),
            limit: parseInt(limit),
            hasMore: hasMore
        });

    } catch (error) {
        console.error('Error getting unified gallery:', error);
        res.status(500).json({
            error: 'Failed to get unified gallery',
            details: error.message
        });
    }
}
