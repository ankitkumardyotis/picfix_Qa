import prisma from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';

async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Get current date ranges
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            // Basic counts
            totalUsers,
            totalImages,
            totalRevenue,
            totalPayments,
            activeUsersCount,
            
            // Today's stats
            todayUsers,
            todayImages,
            todayRevenue,
            
            // This month's stats
            monthlyUsers,
            monthlyImages,
            monthlyRevenue,
            
            // Last month's stats for comparison
            lastMonthUsers,
            lastMonthImages,
            lastMonthRevenue,
            
            // Failed payments
            failedPayments,
            pendingPayments
        ] = await Promise.all([
            // Basic counts
            prisma.user.count(),
            prisma.history.count({ where: { status: 'completed' } }),
            prisma.paymentHistory.aggregate({
                where: { paymentStatus: { in: ['captured', 'payment_success'] } },
                _sum: { amount: true }
            }),
            prisma.paymentHistory.count({ where: { paymentStatus: { in: ['captured', 'payment_success'] } } }),
            
            // Active users
            prisma.user.count({
                where: {
                    history: {
                        some: {
                            createdAt: { gte: thirtyDaysAgo }
                        }
                    }
                }
            }),
            
            // Today's stats
            prisma.user.count({
                where: { createdAt: { gte: startOfToday } }
            }),
            prisma.history.count({
                where: { 
                    status: 'completed',
                    createdAt: { gte: startOfToday }
                }
            }),
            prisma.paymentHistory.aggregate({
                where: { 
                    paymentStatus: { in: ['captured', 'payment_success'] },
                    createdAt: { gte: startOfToday }
                },
                _sum: { amount: true }
            }),
            
            // This month's stats
            prisma.user.count({
                where: { createdAt: { gte: startOfMonth } }
            }),
            prisma.history.count({
                where: { 
                    status: 'completed',
                    createdAt: { gte: startOfMonth }
                }
            }),
            prisma.paymentHistory.aggregate({
                where: { 
                    paymentStatus: { in: ['captured', 'payment_success'] },
                    createdAt: { gte: startOfMonth }
                },
                _sum: { amount: true }
            }),
            
            // Last month's stats
            prisma.user.count({
                where: { 
                    createdAt: { 
                        gte: startOfLastMonth,
                        lt: endOfLastMonth
                    }
                }
            }),
            prisma.history.count({
                where: { 
                    status: 'completed',
                    createdAt: { 
                        gte: startOfLastMonth,
                        lt: endOfLastMonth
                    }
                }
            }),
            prisma.paymentHistory.aggregate({
                where: { 
                    paymentStatus: { in: ['captured', 'payment_success'] },
                    createdAt: { 
                        gte: startOfLastMonth,
                        lt: endOfLastMonth
                    }
                },
                _sum: { amount: true }
            }),
            
            // Failed and pending payments
            prisma.paymentHistory.count({ where: { paymentStatus: 'failed' } }),
            prisma.paymentHistory.count({ where: { paymentStatus: 'pending' } })
        ]);

        // Calculate growth percentages
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous * 100);
        };

        // Calculate conversion rate
        const usersWithPayments = await prisma.paymentHistory.findMany({
            where: { paymentStatus: 'captured' },
            select: { userId: true },
            distinct: ['userId']
        });
        const conversionRate = totalUsers > 0 ? (usersWithPayments.length / totalUsers * 100) : 0;

        // Calculate average credits per user
        const avgCreditsResult = await prisma.plan.aggregate({
            _avg: { creditPoints: true }
        });

        // Extract amounts
        const totalRevenueAmount = totalRevenue._sum.amount || 0;
        const todayRevenueAmount = todayRevenue._sum.amount || 0;
        const monthlyRevenueAmount = monthlyRevenue._sum.amount || 0;
        const lastMonthRevenueAmount = lastMonthRevenue._sum.amount || 0;

        // Debug logging - check all payment records
        const allPayments = await prisma.paymentHistory.findMany({
            select: {
                paymentStatus: true,
                amount: true,
                createdAt: true
            }
        });
        
        const allPaymentStatuses = await prisma.paymentHistory.groupBy({
            by: ['paymentStatus'],
            _count: { paymentStatus: true }
        });

        console.log('Payment Stats Debug:');
        console.log('Total Payment Records:', allPayments.length);
        console.log('Payment Status Distribution:', allPaymentStatuses);
        console.log('All Payments:', allPayments.slice(0, 5)); // Show first 5 records
        console.log('Total Payments Count (captured):', totalPayments);
        console.log('Total Revenue Object:', totalRevenue);
        console.log('Total Revenue Amount:', totalRevenueAmount);
        console.log('Failed Payments:', failedPayments);
        console.log('Pending Payments:', pendingPayments);

        // Calculate growth rates
        const userGrowth = calculateGrowth(monthlyUsers, lastMonthUsers);
        const imageGrowth = calculateGrowth(monthlyImages, lastMonthImages);
        const revenueGrowth = calculateGrowth(monthlyRevenueAmount, lastMonthRevenueAmount);

        res.status(200).json({
            success: true,
            stats: {
                // Core metrics
                totalUsers: {
                    value: totalUsers,
                    change: userGrowth.toFixed(1),
                    changeType: userGrowth >= 0 ? 'positive' : 'negative'
                },
                activeUsers: {
                    value: activeUsersCount,
                    change: ((activeUsersCount / totalUsers) * 100).toFixed(1),
                    changeType: 'positive'
                },
                totalRevenue: {
                    value: totalRevenueAmount,
                    change: revenueGrowth.toFixed(1),
                    changeType: revenueGrowth >= 0 ? 'positive' : 'negative'
                },
                monthlyRevenue: {
                    value: monthlyRevenueAmount,
                    change: revenueGrowth.toFixed(1),
                    changeType: revenueGrowth >= 0 ? 'positive' : 'negative'
                },
                totalImages: {
                    value: totalImages,
                    change: imageGrowth.toFixed(1),
                    changeType: imageGrowth >= 0 ? 'positive' : 'negative'
                },
                todayImages: {
                    value: todayImages,
                    change: '0.0', // Could calculate vs yesterday if needed
                    changeType: 'neutral'
                },
                conversionRate: {
                    value: conversionRate.toFixed(1),
                    change: '0.0', // Could calculate vs last month if needed
                    changeType: 'neutral'
                },
                avgCreditsPerUser: {
                    value: Math.round(avgCreditsResult._avg.creditPoints || 0),
                    change: '0.0', // Could calculate trend if needed
                    changeType: 'neutral'
                }
            },
            dailyStats: {
                newUsers: todayUsers,
                imagesProcessed: todayImages,
                revenue: todayRevenueAmount,
                payments: await prisma.paymentHistory.count({
                    where: { 
                        paymentStatus: { in: ['captured', 'payment_success'] },
                        createdAt: { gte: startOfToday }
                    }
                })
            },
            monthlyStats: {
                newUsers: monthlyUsers,
                imagesProcessed: monthlyImages,
                revenue: monthlyRevenueAmount,
                payments: await prisma.paymentHistory.count({
                    where: { 
                        paymentStatus: { in: ['captured', 'payment_success'] },
                        createdAt: { gte: startOfMonth }
                    }
                })
            },
            paymentStats: {
                total: totalPayments,
                failed: failedPayments,
                pending: pendingPayments,
                successRate: totalPayments > 0 ? ((totalPayments / (totalPayments + failedPayments)) * 100).toFixed(1) : 100
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default withAdminAuth(handler);
