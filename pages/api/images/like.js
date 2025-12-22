import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ error: 'You must be logged in to like images' });
    }

    try {
        const { publishedImageId, exampleImageId, action } = req.body;

        if (!publishedImageId && !exampleImageId) {
            return res.status(400).json({ error: 'Either publishedImageId or exampleImageId is required' });
        }

        if (publishedImageId && exampleImageId) {
            return res.status(400).json({ error: 'Cannot specify both publishedImageId and exampleImageId' });
        }

        if (!['like', 'unlike'].includes(action)) {
            return res.status(400).json({ error: 'Action must be "like" or "unlike"' });
        }

        const userId = session.user.id;
        const isExampleImage = !!exampleImageId;

 
        // Check if the image exists (published or example)
        let imageExists = false;
        let currentLikes = 0;

        if (isExampleImage) {
            // For example images, ensure stats record exists
            let exampleStats = await prisma.exampleImageStats.findUnique({
                where: { imageId: exampleImageId }
            });


            if (!exampleStats) {
                // Create stats record for new example image
                const [model, imagePath] = exampleImageId.split('::');
                exampleStats = await prisma.exampleImageStats.create({
                    data: {
                        imageId: exampleImageId,
                        model: model,
                        imagePath: imagePath,
                        likes: 0,
                        downloads: 0,
                        views: 0
                    }
                    });
            }
            imageExists = true;
            currentLikes = exampleStats.likes;
        } else {
            // For published images
            const publishedImage = await prisma.publishedImage.findUnique({
                where: { id: publishedImageId },
                select: { id: true, likes: true }
            });

            if (!publishedImage) {
                return res.status(404).json({ error: 'Image not found' });
            }
            imageExists = true;
            currentLikes = publishedImage.likes;
        }

        if (action === 'like') {
            // Check if user already liked this image
            let existingLike;
            if (isExampleImage) {
                existingLike = await prisma.imageLike.findFirst({
                    where: {
                        userId: userId,
                        exampleImageId: exampleImageId
                    }
                });
            } else {
                existingLike = await prisma.imageLike.findUnique({
                    where: {
                        userId_publishedImageId: {
                            userId: userId,
                            publishedImageId: publishedImageId
                        }
                    }
                });
            }

            if (existingLike) {
                return res.status(400).json({ error: 'You have already liked this image' });
            }

            // Create new like and increment counter
            let updatedLikes;
            if (isExampleImage) {
                await prisma.$transaction([
                    prisma.imageLike.create({
                        data: {
                            userId: userId,
                            exampleImageId: exampleImageId
                        }
                    }),
                    prisma.exampleImageStats.update({
                        where: { imageId: exampleImageId },
                        data: { likes: { increment: 1 } }
                    })
                ]);

                const updatedStats = await prisma.exampleImageStats.findUnique({
                    where: { imageId: exampleImageId },
                    select: { likes: true }
                });
                updatedLikes = updatedStats.likes;
            } else {
                await prisma.$transaction([
                    prisma.imageLike.create({
                        data: {
                            userId: userId,
                            publishedImageId: publishedImageId
                        }
                    }),
                    prisma.publishedImage.update({
                        where: { id: publishedImageId },
                        data: { likes: { increment: 1 } }
                    })
                ]);

                const updatedImage = await prisma.publishedImage.findUnique({
                    where: { id: publishedImageId },
                    select: { likes: true }
                });
                updatedLikes = updatedImage.likes;
            }

            res.status(200).json({
                success: true,
                action: 'liked',
                likes: updatedLikes,
                userLiked: true
            });

        } else if (action === 'unlike') {
            // Check if user actually liked this image
            let existingLike;
            if (isExampleImage) {
                existingLike = await prisma.imageLike.findFirst({
                    where: {
                        userId: userId,
                        exampleImageId: exampleImageId
                    }
                });
            } else {
                existingLike = await prisma.imageLike.findUnique({
                    where: {
                        userId_publishedImageId: {
                            userId: userId,
                            publishedImageId: publishedImageId
                        }
                    }
                });
            }

            if (!existingLike) {
                return res.status(400).json({ error: 'You have not liked this image' });
            }

            // Remove like and decrement counter
            let updatedLikes;
            if (isExampleImage) {
                await prisma.$transaction([
                    prisma.imageLike.delete({
                        where: { id: existingLike.id }
                    }),
                    prisma.exampleImageStats.update({
                        where: { imageId: exampleImageId },
                        data: { likes: { decrement: 1 } }
                    })
                ]);

                const updatedStats = await prisma.exampleImageStats.findUnique({
                    where: { imageId: exampleImageId },
                    select: { likes: true }
                });
                updatedLikes = updatedStats.likes;
            } else {
                await prisma.$transaction([
                    prisma.imageLike.delete({
                        where: { id: existingLike.id }
                    }),
                    prisma.publishedImage.update({
                        where: { id: publishedImageId },
                        data: { likes: { decrement: 1 } }
                    })
                ]);

                const updatedImage = await prisma.publishedImage.findUnique({
                    where: { id: publishedImageId },
                    select: { likes: true }
                });
                updatedLikes = updatedImage.likes;
            }

            res.status(200).json({
                success: true,
                action: 'unliked',
                likes: updatedLikes,
                userLiked: false
            });
        }

    } catch (error) {
        console.error('Error handling like/unlike:', error);
        res.status(500).json({
            error: 'Failed to handle like/unlike',
            details: error.message
        });
    }
} 