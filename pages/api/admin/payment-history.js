import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build where clause for filtering
        let whereClause = {};
        
        if (status && status !== 'all') {
            whereClause.paymentStatus = status;
        }
        
        if (search) {
            whereClause.OR = [
                { userName: { contains: search, mode: 'insensitive' } },
                { emailId: { contains: search, mode: 'insensitive' } },
                { transactionId: { contains: search, mode: 'insensitive' } },
                { orderId: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Fetch payments with user data
        const payments = await prisma.paymentHistory.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            skip: skip,
            take: parseInt(limit),
            select: {
                id: true,
                transactionId: true,
                orderId: true,
                userId: true,
                userName: true,
                emailId: true,
                contact: true,
                planName: true,
                creditPoints: true,
                amount: true,
                currency: true,
                paymentStatus: true,
                createdAt: true
            }
        });

        // Get total count for pagination
        const totalCount = await prisma.paymentHistory.count({
            where: whereClause
        });

        // Transform payment data
        const transformedPayments = payments.map(payment => ({
            id: payment.id,
            transactionId: payment.transactionId,
            orderId: payment.orderId,
            userId: payment.userId,
            userName: payment.userName,
            userEmail: payment.emailId,
            contact: payment.contact,
            plan: payment.planName,
            credits: payment.creditPoints,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.paymentStatus,
            date: payment.createdAt,
            // Determine payment method (could be enhanced with actual data if available)
            paymentMethod: 'Razorpay', // Default since using Razorpay
        }));

        res.status(200).json({
            success: true,
            payments: transformedPayments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default withAdminAuth(handler);
