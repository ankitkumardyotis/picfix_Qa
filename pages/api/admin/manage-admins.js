import prisma from '@/lib/prisma';
import { withSuperAdminAuth } from '@/lib/adminAuth';

async function handler(req, res) {
    const { method } = req;
    const { session } = req; // Added by withSuperAdminAuth middleware

    switch (method) {
        case 'GET':
            return await getAdmins(req, res);
        case 'POST':
            return await promoteToAdmin(req, res, session);
        case 'DELETE':
            return await removeAdmin(req, res, session);
        default:
            return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

// Get all admin users
async function getAdmins(req, res) {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build search conditions
        const searchConditions = search ? {
            AND: [
                {
                    OR: [
                        { role: 'admin' },
                        { role: 'super_admin' }
                    ]
                },
                {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } }
                    ]
                }
            ]
        } : {
            OR: [
                { role: 'admin' },
                { role: 'super_admin' }
            ]
        };

        // Get total count
        const totalAdmins = await prisma.user.count({
            where: searchConditions
        });

        // Get admin users
        const admins = await prisma.user.findMany({
            where: searchConditions,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                emailVerified: true
            },
            orderBy: [
                { role: 'desc' }, // super_admin first
                { createdAt: 'desc' }
            ],
            skip: offset,
            take: parseInt(limit)
        });

        const totalPages = Math.ceil(totalAdmins / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.status(200).json({
            admins,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: totalAdmins,
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Promote user to admin
async function promoteToAdmin(req, res, session) {
    try {
        const { userId, email } = req.body;

        if (!userId && !email) {
            return res.status(400).json({ message: 'User ID or email is required' });
        }

        // Find user by ID or email
        const whereClause = userId ? { id: userId } : { email };
        const user = await prisma.user.findUnique({
            where: whereClause,
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'User is already an admin' });
        }

        if (user.role === 'super_admin') {
            return res.status(400).json({ message: 'User is already a super admin' });
        }

        // Update user role to admin
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        res.status(200).json({
            message: 'User promoted to admin successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error promoting user to admin:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Remove admin role (demote to user)
async function removeAdmin(req, res, session) {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent super admin from removing themselves
        if (user.id === session.user.id) {
            return res.status(400).json({ message: 'Cannot remove admin role from yourself' });
        }

        // Only allow removing admin role, not super_admin
        if (user.role === 'super_admin') {
            return res.status(400).json({ message: 'Cannot remove super admin role' });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin' });
        }

        // Update user role to regular user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: 'user' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });

        res.status(200).json({
            message: 'Admin role removed successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error removing admin role:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default withSuperAdminAuth(handler);
