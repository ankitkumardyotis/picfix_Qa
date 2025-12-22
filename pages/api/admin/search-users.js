import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../lib/adminAuth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Check authentication and admin role
        const session = await getServerSession(req, res, authOptions);
        
        if (!session || !session.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!isAdmin(session)) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
        }

        const searchTerm = q.trim();

        // Search users by email or name
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                email: {
                                    contains: searchTerm,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                name: {
                                    contains: searchTerm,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    },
                    // Include all users - let the frontend handle role restrictions if needed
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
                role: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10 // Limit results to 10 users
        });

        // If no results with contains, try a fallback search with startsWith
        let fallbackUsers = [];
        if (users.length === 0) {
            fallbackUsers = await prisma.user.findMany({
                where: {
                    OR: [
                        {
                            email: {
                                startsWith: searchTerm,
                                mode: 'insensitive'
                            }
                        },
                        {
                            name: {
                                startsWith: searchTerm,
                                mode: 'insensitive'
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    createdAt: true,
                    role: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            });
        }
        
        const finalUsers = users.length > 0 ? users : fallbackUsers;

        return res.status(200).json({
            success: true,
            users: finalUsers,
            count: finalUsers.length
        });

    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
