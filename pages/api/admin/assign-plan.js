import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { isAdmin } from '../../../lib/adminAuth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
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

        const { userId, planName, creditPoints, expiryDays } = req.body;

        // Validate input
        if (!userId || !planName || !creditPoints || !expiryDays) {
            return res.status(400).json({ 
                message: 'Missing required fields: userId, planName, creditPoints, and expiryDays are required' 
            });
        }

        // Validate credit points
        const credits = parseInt(creditPoints);
        if (isNaN(credits) || credits <= 0) {
            return res.status(400).json({ message: 'Credit points must be a positive number' });
        }

        // Validate expiry days
        const expiry = parseInt(expiryDays);
        if (isNaN(expiry) || expiry <= 0) {
            return res.status(400).json({ message: 'Expiry days must be a positive number' });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent assigning plans to super admin users only
        if (user.role === 'super_admin') {
            return res.status(400).json({ message: 'Cannot assign plans to super admin users' });
        }

        // Calculate expiry date
        const currentDate = new Date();
        const expiryDate = new Date(currentDate);
        expiryDate.setDate(expiryDate.getDate() + expiry);
        const expiryISOString = expiryDate.toISOString();

        // Create or update user's plan
        const planData = await prisma.plan.upsert({
            where: {
                userId: userId
            },
            update: {
                userName: user.name,
                emailId: user.email,
                planName: planName.trim(),
                creditPoints: {
                    increment: credits
                },
                remainingPoints: {
                    increment: credits
                },
                createdAt: currentDate,
                expiredAt: expiryISOString,
            },
            create: {
                userId: userId,
                userName: user.name,
                emailId: user.email,
                planName: planName.trim(),
                creditPoints: credits,
                remainingPoints: credits,
                createdAt: currentDate,
                expiredAt: expiryISOString,
            }
        });


        return res.status(200).json({
            success: true,
            message: `Successfully assigned ${planName} plan with ${credits} credits to ${user.name || user.email}`,
            plan: {
                id: planData.id,
                planName: planData.planName,
                creditPoints: planData.creditPoints,
                remainingPoints: planData.remainingPoints,
                expiredAt: planData.expiredAt
            },
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error assigning plan:', error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Plan assignment conflict occurred' });
        }
        
        return res.status(500).json({ 
            message: 'Internal server error while assigning plan',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
